var socket = io.connect(location.hostname);

socket.socketSend = function(data,name) {
  var sending = socket.emit(name,data);
};


socket.once('connect', function(){ 
	socket.emit('getSuggestList')
}); 

socket.on('suggestList',function(data) {
	window.SuggestList.newList(data,function(count) {
		var guiText = "Jobpins hat " + count +" Kategorien für Sie";	
	setSlogen(guiText,true);
	});
});

socket.on('searchData',function(data) {
	setSlogen("Categorien Daten bekommen");
	
	var tmpData = Searches.get(data.id);
	var firstDoc = _.keys(data.data.couchid);
	firstDoc.sort();
	tmpData.set({
		couchids:data.data.couchid,
		docOpen:firstDoc[0]
	});
	tmpData.save();
	Searches.changeUrl(tmpData.attributes.content);
	
});

socket.on('docData',function(data) {
	var tmpData = Searches.get(data.id);
	for (var i = 0 ;i<data.data.length;i++) {
		tmpData.attributes.couchids[data.data[i].id] = data.data[i].doc;
		if (data.data[i].id == tmpData.attributes.docOpen) {
			Documents.renderBang(data.id);
		};
	}
	tmpData.save();
	setSlogen("Documenten daten bekommen");
});

socket.on('newests',function(data) {
	console.log("newests");
	setSlogen("Neue Data @Server " + data);
	InfoData.updateData();
});

socket.on('ServerInfo',function(data) {
	//console.log(data);
	console.log("new ServerInfo");
	InfoData.newData(data);
});

socket.once('disconnect', function(){ 
	setSlogen("Server disconnected");
});


function setSlogen(newText,defaultText) {
	var self = this;
	if (defaultText==true) self.oldText = newText;
	$("#slogen").text(newText);
	window.setTimeout(function() {
		$("#slogen").text(oldText);
	},2000,self.oldText);
}