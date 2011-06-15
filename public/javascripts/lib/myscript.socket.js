var socket = new io.Socket(location.hostname);

io.Socket.prototype.socketSend = function(data,name) {
	var sendData = {};
	console.log("socketSend");
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
		//console.log(data.searchData.data.couchid);
		var tmpData = Searches.get(data.searchData.id);
		//console.log(_.keys(data.searchData.data.couchid)[0]);
		tmpData.set({
			couchids:data.searchData.data.couchid,
			docOpen:_.keys(data.searchData.data.couchid)[0],
		});
		tmpData.save();
	}
	if (data.docData) {
		//console.log(data.docData);
		var tmpData = Searches.get(data.docData.id);
		for (key in data.docData.data) {
			//console.log(tmpData.attributes.couchids[key]);

			tmpData.attributes.couchids[key] = data.docData.data[key];
		}
		tmpData.save();
		console.log(data.docData.data);
		console.log(data.docData.data[tmpData.attributes.docOpen]);
	  if (data.docData.data[tmpData.attributes.docOpen]) Documents.render(data.docData.id)		
		//console.log(tmpData);
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
