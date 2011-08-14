$(function(){
    var scrollToBottom = function ()
    {
        $("#log").animate({scrollTop: $("#log")[0].scrollHeight}, {duration: "slow", easing:"swing", queue: false});
    }
    

    var wall = io.connect('http://hapicheckin.com/wall');
    wall.on('post_tweet', function (tweet) {
        console.log(tweet);
        var tweeturl = "http://www.twitter.com/"+tweet.from_user +"/status/"+tweet.id_str;
        var adiv = $("<div id='" +tweet.id_str + "'></div>");
        var a = $("<a href='"+tweeturl+"'><strong>" + tweet.from_user + "</strong>: " + tweet.text + "</a>");
        adiv.append(a);
        
        $("#log").append(adiv);
        
        //$("#log").append("<div><strong>" + tweet.from_user + "</strong>: " + tweet.text + "</div>");
        $.embedly(tweeturl, {key: "a0d4690ac60a11e0b9a74040d3dc5c07", maxWidth: 640, maxHeight:480, autoplay:"true"} , function(data) {
            adiv.html(data.html);
            scrollToBottom();
        });
        scrollToBottom();
        //socket.emit('my other event', { my: 'data' });
    });
    
    wall.on('post_checkin', function (data) {
        console.log(data);
        $("#log").append("<div>" + data.name + " has arrived. <br/> <img src='data:image/gif;base64," + data.picData + "'/></div>");
        scrollToBottom();
        //socket.emit('my other event', { my: 'data' });
    });

    wall.on('post_klout', function (data) {
        
        if ("users" in data)
        {
            var block = '<iframe src="http://widgets.klout.com/badge/' + data.users[0].twitter_screen_name + '" style="border:0" scrolling="no" allowTransparency="true" frameBorder="0" width="200px" height="98px"></iframe>';
             $("#log").append($(block))
        }
        
        console.log(data);
    });
    
    wall.on('post_rapleaf', function (data) {
        console.log(data);
    });
    /*  
	 var socket = new io.Socket(); 
	 socket.connect();
	 socket.on('connect', function(){ 
		//$("#log").append("<div><strong>connected to server. listening for calls.</strong></div>");
	 });
	 socket.on('message', function(obj){
		if ("msg" in obj) {
			$("#log").append("<div>" + obj.msg + "</div>");
		}
		if ("calls" in obj) {
			$("#phonecalls").text(obj.calls);
		}
		if ("clients" in obj) {
			$(".client_count").text(obj.clients);
		}
	 });
	 socket.on('disconnect', function(){
		//$("#log").append("<p><strong>disconnected from the server</strong></p>");
	 });
	 */
});
