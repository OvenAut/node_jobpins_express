var socket = new io.Socket(location.hostname);

io.Socket.prototype.socketSend = function(data,name) {
	var sendData = {};
	
	sendData[name] = data;
  var sending = socket.send({
		sid:  connect.sid,
		data: sendData		
		});
};


socket.on('connect', function(){ 
	//Searches.trigger('socket');
	//window.App.socket
  //Search.trigger('socket');
  //socket.socketSend(data,'connection');
  //data = {};
}); 


socket.on('message', function(data){

	if (data.suggest) {
		
		if (_.isEmpty(data.suggest)) {
			console.log("no Suggests");
			nodata = true;
		} else {
			nodata = false;
		}
		window.App.showSuggest(data.suggest);
		//Searches.trigger('showSuggest',data);
		//console.log(data);
	} 

  //console.log('incomming');		

}); 


socket.on('disconnect', function(){ 
	console.log('disconnected');
});