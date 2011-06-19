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
		var firstDoc = _.keys(data.searchData.data.couchid);
		firstDoc.sort();
		console.log("firstDoc" + _.first(firstDoc));
		tmpData.set({
			couchids:data.searchData.data.couchid,
			docOpen:firstDoc[0]
		});
		tmpData.save();
		Searches.changeUrl(tmpData.attributes.content);
		// var url = encodeURIComponent(tmpData.attributes.content);
		// //console.log(url);
		// window.location.href = "/#!/categories/" + url + "/0";
		//Searches.isActiv(data.searchData.id);
	}
	if (data.docData) {
		//console.log(data.docData);
		console.log("GET DOCDATA");
		var tmpData = Searches.get(data.docData.id);
		for (var i = 0 ;i<data.docData.data.length;i++) {
			//console.log(data.docData.data[i].id);
      
			tmpData.attributes.couchids[data.docData.data[i].id] = data.docData.data[i].doc;
			if (data.docData.data[i].id == tmpData.attributes.docOpen) {
				//console.log("render from loop");
				
				Documents.renderBang(data.docData.id);
			};
		}
		tmpData.save();
		// console.log(data.docData.data);
		// console.log(data.docData.data.id[tmpData.attributes.docOpen]);
		// 
		// 	  if (data.docData.data[tmpData.attributes.docOpen]) Documents.render(data.docData.id)		
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
