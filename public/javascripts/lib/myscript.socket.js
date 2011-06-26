var socket = io.connect(location.hostname);

socket.socketSend = function(data,name) {
	//var sendData = {};
	//console.log("socketSend");
	//sendData[name] = data;
  var sending = socket.emit(name,data);
};


socket.on('connect', function(){ 
	socket.emit('getSuggestList')
	//Searches.trigger('socket');
	//window.App.socket
  //Search.trigger('socket');
  //socket.socketSend(data,'connection');
  //data = {};
}); 

socket.on('suggestList',function(data) {
	//console.log(data);
	window.SuggestList.newList(data,function(count) {
		var guiText = "Jobpins hat " + count +" Kategorien für Sie";	
	  //$('#slogen').text(guiText);
	setSlogen(guiText,true);
	});
});

socket.on('searchData',function(data) {
	//$("#slogen").text("searchData");
	setSlogen("Categorien Daten bekommen");
	
	var tmpData = Searches.get(data.id);
	//console.log(_.keys(data.searchData.data.couchid)[0]);
	var firstDoc = _.keys(data.data.couchid);
	firstDoc.sort();
	//console.log("firstDoc" + _.first(firstDoc));
	tmpData.set({
		couchids:data.data.couchid,
		docOpen:firstDoc[0]
	});
	tmpData.save();
	Searches.changeUrl(tmpData.attributes.content);
	
});

socket.on('docData',function(data) {
	//console.log("GET DOCDATA");
		//$("#slogen").text("docData");

		
	var tmpData = Searches.get(data.id);
	for (var i = 0 ;i<data.data.length;i++) {
		//console.log(data.docData.data[i].id);
    
		tmpData.attributes.couchids[data.data[i].id] = data.data[i].doc;
		if (data.data[i].id == tmpData.attributes.docOpen) {
			//console.log("render from loop");
			
			Documents.renderBang(data.id);
		};
	}
	tmpData.save();
	setSlogen("Documenten daten bekommen");
});

socket.on('newests',function(data) {
	setSlogen("Neue Data @Server " + data);
});

socket.once('disconnect', function(){ 
	//console.log('disconnected');
	setSlogen("Server disconnected");
	//$("#slogen").text("disconnected");
});


function setSlogen(newText,defaultText) {
	var self = this;
	//var oldText = oldText;
	if (defaultText==true) self.oldText = newText;
	//console.log(oldText);
	$("#slogen").text(newText);
	window.setTimeout(function() {
		//console.log(oldText);
		$("#slogen").text(oldText);
	},2000,self.oldText);
}