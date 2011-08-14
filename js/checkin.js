$(function() {
    
    var wall = io.connect('http://hapicheckin.com/checkin');
	// ---------------------------------------------------------------------------------
	// OpenTok vars and functions
	// ---------------------------------------------------------------------------------
	var apiKey = '11427';
	var sessionId = '28757622dbf26a5a7599c2d21323765662f1d436';
	var token = 'devtoken';	

	var publisher;
	var session = TB.initSession(sessionId);

	// Set up event listeners
	session.addEventListener('sessionConnected', sessionConnectedHandler);
	session.addEventListener('streamCreated', streamCreatedHandler);
	session.connect(apiKey, token);

	// On session connect handler
	function sessionConnectedHandler(event) {
		var div = document.createElement('div');
		div.setAttribute('id', 'publisher');

		document.getElementById('publisher').appendChild(div);

		publisher = session.publish(div.id);
	}

	// On stream created handler
	function streamCreatedHandler(event) {
		for (var i = 0; i < event.streams.length; i++) {
			// Enable the identify button as soon as the publisher hits 'Allow'
			if (event.streams[i].connection.connectionId == session.connection.connectionId) {
				//$("#identifyButton").css("display", "block");
			}
		}
	}
    
	// ---------------------------------------------------------------------------------
	// UI handlers
	// ---------------------------------------------------------------------------------	
	$("#checkin_form").submit(function() {	
	    
		var imgData = publisher.getImgData();

        wall.emit("new checkin",{
            name:$("#formname").val(),
            email:$("#formemail").val(),
            picData:imgData,
            twitterName:$("#formtwitter").val()
        });
        
        /*imgur.getImageURL(imgData, function (link) {
            
        });*/
        
		return false;
	});
});


// ---------------------------------------------------------------------------------
// Imgur REST API Methods
// ---------------------------------------------------------------------------------
var imgurClient = {
	// Imgur variables
	api_key: 'f9d2936ab67d16145c6966a2f01a0a28',

	// Takes a base64 string and returns a link to the image
	getImageURL: function(imgData, callback) {
		var data = {
			key: imgurClient.api_key,
			image: imgData,
			type: 'base64'
		};

		log.message("saving image...");
		$.post('http://api.imgur.com/2/upload.json', data, function(response) {
			log.message("image saved.");
			callback(response.upload.links.original);
		});	
	}
};

// ---------------------------------------------------------------------------------
// Logging Methods
// ---------------------------------------------------------------------------------
var log = {
	// Writes a message to the logging area
	message: function(message) {
		var log = $("<li />", {
			text: message
		});

		$("#logs").prepend(log);
	},

	// Clears the logging area
	clear: function() {
		$("#logs").html('');
	}
};