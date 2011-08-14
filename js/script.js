$(function(){
    
    var wall = io.connect('http://10.0.1.92/wall');
    wall.on('post_tweet', function (data) {
        console.log(data);
         $("#log").append("<div>" + data.text + "</div>");
        //socket.emit('my other event', { my: 'data' });
    });
    
    wall.on('post_checkin', function (data) {
        console.log(data);
        $("#log").append("<div>" + data.name + " has arrived. <br/> <img src='data:image/gif;base64," + data.picData + "'/></div>");
        //socket.emit('my other event', { my: 'data' });
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
