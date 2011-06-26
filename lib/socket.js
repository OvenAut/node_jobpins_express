var io      = require('socket.io'),
    couchdb = require('couchdb-ovenaut');


io.enable('browser client minification');

io.set('log level',2);
// SOCKET
//var socket = io.listen(app);

io.sockets.on('connection', function(client){ 
		//console.log("connection");
		
	client.on('getSuggestList' ,function() {
		//console.log("ClientConnect");
		couchdb.checkList(function(data) {
				client.emit("suggestList",data);
		});
	});

	client.on('getSearchData',function(data) {
		//console.log(data);
		couchdb.getSearchData(data.key,function(datadb) {
			client.emit("searchData",{data:datadb,id:data.id});
		});	
	});

	client.on('getDocData',function(data) {
		couchdb.getDocData(data.key,function(datadb) {
			client.emit("docData",{data:datadb,id:data.id});
		});
	});
});

exports.io = io;