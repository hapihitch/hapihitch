
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




 