
var opts = {};

opts.port = 20200;

var rest = require('restler');
var express = require('express');
var app = require('express').createServer();
var sys = require('sys');

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

app.listen(8000);
var io = require('socket.io').listen(app); 

var checkinsocket = io.of('/checkin').on('connection', function(socket){ 
	socket.on('new checkin', function(obj){ 
		sendNewCheckInToWall(obj);
	});
	
  	socket.on('disconnect', function(){
		
	});
});

var wallsocket = io.of('/wall').on('connection', function(socket){ 	
  	socket.on('disconnect', function(){
		
	});
});

function sendNewCheckInToWall(obj) {
    console.log(obj.name);
    wallsocket.emit("post_checkin", obj);
}

function sendNewTweetToWall(tweetObject) {
    wallsocket.emit("post_tweet", tweet);
}

var twitterPoll = new TwitterPoll("hapihack", function(tweet) {
	console.log("callback: "+tweet.text);
});
//twitter polling service
function TwitterPoll(hashtag, callback) {
	this.hashtag = hashtag;
	this.last_id = 0;
	this.callback = callback;
	this.poll_interval = 2000;
	
	var _this = this;
	this.poll = function() {
		console.log("polling..");
		rest.get("http://search.twitter.com/search.json", {
			query:{
				q:"#"+this.hashtag,
				rpp:20,
				since_id:this.last_id
			}
		}).on('complete', function(data) {
			//grab tweets
			var results = data.results;
			console.log("Num tweets: "+results.length);
			
			for (var i=0; i<results.length;i++) {
				var result = results[i];
				//edge case since api always returns 1 tweet
				if (result.id != _this.last_id) {
					//inform the callback of each new tweet
					if(_this.callback != null)
						_this.callback(result);
				}
				
				if(i == 0)
					_this.last_id = result.id;

				
				
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
	}, 2000);
}




 