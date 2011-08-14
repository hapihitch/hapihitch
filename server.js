
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
	res.sendfile("campaign.html");
});

app.get('/', function(req, res){
	res.sendfile("index.html");
});

app.use(express.static(__dirname + '/'));

var clientCount = 0;

app.listen(8000);
var io = require('socket.io').listen(app); 

var checkinsocket = io.of('/checkin').on('connection', function(socket){ 
	socket.on('new checkin', function(name,email,pic,twitter){ 
		sendNewCheckInToWall(name,email,pic,twitter);
	});
	
  	socket.on('disconnect', function(){
		
	});
});

var wallsocket = io.of('/wall').on('connection', function(socket){ 	
  	socket.on('disconnect', function(){
		
	});
});

function sendNewCheckInToWall(name,email,pic,twitter) {
    wallsocket.emit("new checkin", {name:name,email:email,picData:pic,twitterName:twitter});
}

function sendNewTweetToWall(tweetObject) {
    wallsocket.emit("new tweet", tweet);
}




 