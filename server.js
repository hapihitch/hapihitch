
var opts = {};

opts.port = 20200;

var rest = require('restler');
var express = require('express');
var app = require('express').createServer();
var sys = require('sys');
var util = require('util'),
    exec = require('child_process').exec,
    child;
var fs = require('fs');
var callcount = 0;

app.use(express.bodyParser());
app.use(app.router);

app.get('/checkin', function(req, res){
	res.sendfile("checkin.html");
});

app.get('/', function(req, res){
	res.sendfile("index.html");
});

app.use(express.static(__dirname + '/'));

var clientCount = 0;

app.listen(80);
var io = require('socket.io').listen(app); 
io.set('log level', 1);

/*io.set('transports', [                     // enable all transports (optional if you want flashsocket)
  'xhr-polling'
]);*/

var checkinsocket = io.of('/checkin').on('connection', function(socket){ 
	socket.on('new checkin', function(obj){ 
		console.log("Checkin!");
	    sendNewCheckInToWall(obj);
	    
	    if (obj.twitterName)
	    {
	        var twittername = obj.twitterName;
	        rest.get("http://api.klout.com/1/users/show.json", { 
	            query:{
	                users: twittername,
	                key: "6t299884yu4ph23dcx4v9kgn"
	            }}).on('complete', function(data) {
	                sendKloutInToWall(data);
                });
            
            
        	/*
        	rest.get("https://personalize.rapleaf.com/v4/dr?email="+obj.email+"&api_key=9e9da3ba0ce49e113b974e48870aa4c8", {}).on('complete', function(data) {
        	    console.log("User found");
                sendRapLeafToWall(data);
        	});
        	*/
            	
	    }
	    
		var buff = new Buffer(obj.picData, "base64");
		fs.writeFile("/tmp/test.gif", buff, "binary", function(err) {
          if(err) {
            
            console.log(err);
          } else {
            //exec("lpr /tmp/test.gif",null);
            console.log("The file was saved!");
          }
        });
	});
	
  	socket.on('disconnect', function(){
		
	});
});

var walllog = new Array();

//post back log
var wallsocket = io.of('/wall').on('connection', function(socket){ 	
    for (var i in walllog)
    {
        socket.emit("post_"+walllog[i].type, walllog[i].obj);
    }
    
  	socket.on('disconnect', function(){
		
	});
});


function sendNewCheckInToWall(obj) {
    walllog.push({type:"checkin", obj: obj});
	wallsocket.emit("post_checkin", obj);
}

function sendRapLeafToWall(obj) {
    walllog.push({type:"rapleaf", obj: obj});
	wallsocket.emit("post_rapleaf", obj);
}

function sendKloutInToWall(obj) {
    //console.log(obj.name);
    walllog.push({type:"klout", obj: obj});
    wallsocket.emit("post_klout", obj);
}

function sendNewTweetToWall(tweetObject) {
    //console.log(tweetObject);
    walllog.push({type:"tweet", obj: tweetObject});
    wallsocket.emit("post_tweet", tweetObject);
}

var twitterPoll = new TwitterPoll("hapihack", sendNewTweetToWall);

//rapleaf lookup service
function RapLeaf(name, email, callback) {
	//split name into two parts
	var parts = name.split(" ");
	if(parts.length != 2) return;
	
	console.log("parsed name into names: "+parts[0]);
	this.fname = parts[0];
	this.lname = parts[1];
	this.email = email;
	this.callback = null;
	this.api_key = "9e9da3ba0ce49e113b974e48870aa4c8";
	this.callback = callback;
	
	var self = this;
	console.log("making request with: "+this.fname+" "+this.lname+" "+this.email+" "+this.api_key);
	//find the user
	rest.get("http://personalize.rapleaf.com/v4/dr", {
		query:{
			//first:self.fname,
			//last:self.lname,
			email:self.email,
			api_key:self.api_key
		}
	}).on('complete', function(data) {
		console.log("rapleaf data: "+data);
		if(this.callback != null)
			this.callback(data);
	});
}
//twitter polling service
function TwitterPoll(hashtag, callback) {
	this.hashtag = hashtag;
	this.last_id = 0;
	this.callback = callback;
	this.poll_interval = 5000;
	
	var _this = this;
	this.poll = function() {
		//console.log("polling..");
		rest.get("http://search.twitter.com/search.json", {
			query:{
				q:this.hashtag,
				rpp:20,
				since_id:this.last_id
			}
		}).on('complete', function(data) {
			//grab tweets
			var results = data.results;
			//console.log("Num tweets: "+results.length);
			
			
			
			for (var i=results.length-1; i>0;i--) {
				var result = results[i];
				
				//edge case since api always returns 1 tweet
				if (result.id > _this.last_id) {
				    _this.last_id = result.id;
					//inform the callback of each new tweet
					if(_this.callback != null)
						_this.callback(result);
				}
				
			}
			
		});
	}
	this.onUpdate = function(tweet_callback) {
		this.callback = tweet_callback;
	}
	//set callback
	this.onUpdate(callback);
	
	//start polling (with correct this value)
	var _this = this;
	this.interval_id = setInterval(function(t) {
		_this.poll();
	}, this.poll_interval);
}




 