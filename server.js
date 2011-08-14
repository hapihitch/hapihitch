
var opts = {};
var io = require('socket.io'); 
opts.port = 20200;

var rest = require('restler');
var express = require('express');
var app = require('express').createServer();
var sys = require('sys');

var callcount = 0;

app.use(express.bodyParser());
app.use(app.router);

app.get("/phone/count", function(req, res){
	//res.sendfile("phone.html");
	res.send('Phone calls ' + callcount);
});

app.get('/', function(req, res){
	res.sendfile("wall.html");
	//res.send('Phone calls ' + callcount);
});

app.get('/checkin', function(req, res){
	res.sendfile("campaign.html");
	//res.send('Phone calls ' + callcount);
});




app.get('/', function(req, res){
	res.sendfile("index.html");
	//res.send('Phone calls ' + callcount);
});

app.use(express.static(__dirname + '/'));

var clientCount = 0;


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



app.listen(8000);

socket = io.listen(app); 
//socket.set('transports', ['jsonp-polling']);

socket.sockets.on('connection', function(client){ 
	sendData("");
	client.on('message', function(msg){ 
		//sendData(); 
		console.log(msg);
	});
  	client.on('disconnect', function(){
		
	});
});



 