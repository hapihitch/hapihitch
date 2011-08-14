var ACCOUNT_SID = "AC2e9a3f8844f027e4274f234b976c1dca";
var AUTH_TOKEN = "2fed1866ed0c448a5ed88eceda4b79a6";
var MY_HOSTNAME = "ec2-50-19-174-226.compute-1.amazonaws.com";

var opts = {};
var io = require('socket.io'); 
opts.port = 20200;

var rest = require('restler');
var express = require('express');
var app = require('express').createServer();
var sys = require('sys');
var TwilioClient = require('twilio').Client;
var Twiml = require("twilio").Twiml;
var client = new TwilioClient(ACCOUNT_SID, AUTH_TOKEN, MY_HOSTNAME,opts);

var callcount = 0;

app.use(express.bodyParser());
app.use(app.router);

app.get("/phone/count", function(req, res){
	//res.sendfile("phone.html");
	res.send('Phone calls ' + callcount);
});

app.get('/phone', function(req, res){
	res.sendfile("phone.html");
	//res.send('Phone calls ' + callcount);
});

app.get('/2011', function(req, res){
	res.sendfile("campaign.html");
	//res.send('Phone calls ' + callcount);
});

calls = {};



app.get('/', function(req, res){
	res.sendfile("index.html");
	//res.send('Phone calls ' + callcount);
});

app.use(express.static(__dirname + '/'));

var clientCount = 0;

var socket = io.listen(app); 

function sendData(message){
	var obj = {};
	obj.calls = callcount;
	obj.clients = clientCount; 
	if (message)
	{
		obj.msg = message;
	}
	console.log("message");
	console.log(obj)
	socket.broadcast(obj);
}

var sayAttr = {"voice":"man","language":"en", "loop":"1"};
var phone = client.getPhoneNumber("+14157993690");
var isPhoneReady = false;

phone.setup(function(){
	isPhoneReady = true;
	phone.on('incomingCall', function(reqParams, res) {
		callcount+=1;
		sendData("new call from " + reqParams.Caller);
		
		var getZip = new Twiml.Gather(null, {numDigits: 5});
		
		/*var phoneNum = "";
		
		phoneNum = reqParams.Caller[2] + " " + reqParams.Caller[3] + " " + reqParams.Caller[4] + ", ";
		phoneNum += reqParams.Caller[5] + " " + reqParams.Caller[6] + " " + reqParams.Caller[7] + ", ";
		phoneNum += reqParams.Caller[8] + " " + reqParams.Caller[9] + " " + reqParams.Caller[10] + " " + reqParams.Caller[11];
		*/
		getZip.append(new Twiml.Say('Welcome to congress connector. Enter your 5 digit zip code!',sayAttr));
		
		getZip.on("gathered", function(gParams, gresp) {
			sendData("caller " + reqParams.Caller + " entered zip " + gParams.Digits);
			
			
			var path = "http://services.sunlightlabs.com/api/legislators.allForZip.json?apikey=d85fe987cb55459385acf04f2c7e9ed6&zip=" + gParams.Digits;
			
			var options = {
				 host: "services.sunlightlabs.com",
				 port: 80,
				 path: path,
				 method: 'GET'
			};
			
			rest.get(path).on('complete', function(data) { 
				var legislators = data.response.legislators;
				var text = "found " + legislators.length + " legislators. ";
				
				sendData( "for " + reqParams.Caller + " " + text);
				
				var presscount;
				
				for (presscount = 0; presscount<legislators.length;presscount++)
				{
					var membername = legislators[presscount].legislator.firstname + " " + legislators[presscount].legislator.lastname; 
					text += "Press " + (presscount + 1) + " for " + membername + ".,";
				}
				
				var getLeg = new Twiml.Gather(null, {numDigits: 1});
				getLeg.append(new Twiml.Say(text, sayAttr));
				getLeg.on("gathered", function(lParams, lresp) {
					var index = lParams.Digits-1;
					if (index >= 0 && index < legislators.length)
					{
						var legi = legislators[index].legislator;
						sendData("Connecting " + reqParams.Caller + " to " + legi.firstname + " " + legi.lastname + " (" + legi.phone + ")");
						lresp.append(new Twiml.Say("Connecting you! Thanks!,",sayAttr));
						var dial = new Twiml.Dial(legi.phone);
						lresp.append(dial);
					}
					else
					{
						
						lresp.append(new Twiml.Say("Invalid input. Try again.",sayAttr));
					}
					lresp.send();

				});
				
				gresp.append(getLeg);
				gresp.send();
			});
		});
		
		res.append(getZip);
		res.send();
	});
});




socket.on('connection', function(client){ 
	clientCount +=1;
	sendData();
	client.on('message', function(msg){ sendData(); 
			console.log(msg);
			if ("campaign" in msg){
				if ("action" in msg){
					if (msg.action == "connectMe"){
						phone.makeCall(msg.phonenumber, null, function(call){
							call.on('answered', function(reqParams, res) { 
								res.append(new Twiml.Say(",Connecting you through with congress connector!",sayAttr));
								res.append(new Twiml.Dial(msg.legislator));
								res.send();
							});
						});
					}
				}
			}
		});
  	client.on('disconnect', function(){
		clientCount -=1;
		sendData();
	});
})



app.listen(8000);


var app2 = require('express').createServer();

app2.get("^",function(req, res){
	res.redirect("http://50.19.174.226/");
	//res.send('Phone calls ' + callcount);
});

app2.listen(3000);

 