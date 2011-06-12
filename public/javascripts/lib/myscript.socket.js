var socket = new io.Socket(location.hostname);

io.Socket.prototype.socketSend = function(data,name) {
	var sendData = {};
	//console.log("socketSend");
	sendData[name] = data;
  var sending = socket.send({
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
	if (data.suggestList) {
		//console.dir("data.suggestList");
		window.SuggestList.newList(data.suggestList);
	};
	if (data.searchData) {
		console.log(data.searchData.data.couchid);
		var tmpData = Searches.get(data.searchData.id);
		
		tmpData.set({
			couchids:data.searchData.data.couchid,
		});
		tmpData.save();
	}
	// if (data.suggest) {
	// 	
	// 	if (_.isEmpty(data.suggest)) {
	// 		console.log("no Suggests");
	// 		nodata = true;
	// 	} else {
	// 		nodata = false;
	// 	}
	// 	window.App.showSuggest(data.suggest);
	// 	//Searches.trigger('showSuggest',data);
	// 	//console.log(data);
	// } 

  //console.log('incomming');		

}); 


socket.on('disconnect', function(){ 
	console.log('disconnected');
});
