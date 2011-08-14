$(function(){
    
    var socket = io.connect('http://localhost');
    socket.on('news', function (data) {
        console.log(data);
        socket.emit('my other event', { my: 'data' });
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
