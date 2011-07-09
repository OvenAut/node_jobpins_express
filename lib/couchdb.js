var cradle = require('cradle'),
    _      = require('underscore'),
    events = require('events'),
    util   = require('util');
		

var dbjcEvent = new events.EventEmitter();

var connection = new(cradle.Connection)('http://home.oszko.net', 5984, {
    auth: {
        username: 'web',
        password: 'web'
    }
});
var dataBuffer = {value:0};
var dbjc = connection.database('crawler_search_parameters');


// CHECK for updates
dbjc.info(function(err,res) {
	dbjc.changes({since:res.update_seq}).on('response', function(res) {
		res.on('data',function(change) {
			  dbjc.get(change.id,change.changes[0].rev,function(err,res) {
						if (res.lastsearch > res.lastround) {
							util.log("Hi in " + res.query + " gesucht und " + res.countersave + " gefunden!");
						  //console.log(res);
						};

						dbjcEvent.emit("sendChange",{data:res.query});
						var evArray = dbjcEvent.listeners("sendChange");
						if (evArray.length >1 ) evArray.pop();
			  })
		});
	});
});

exports.events = dbjcEvent;




var db = connection.database('jobdata');


//
exports.saveradMarker = function(data) {
	data.model = "radmarker";
	if (data.action=="destroy") {
	  //data.clientId;
	  db.view('radmarker/by_clientId',{
		key   : data.clientId,
		limit : 1,
		}, function(err,res) {
			saveradMaerkerHandler(err,res,data);
		});
	 	
	} else {
		db.view('radmarker/by_id',{
			key:data.id,
			limit:1,
		}, function(err,res) {
			saveradMaerkerHandler(err,res,data);
		});
	};
};

function saveradMaerkerHandler(err,res,data) {
  if (err) console.log(err.error);
	if (res.length) {
		//console.log(data);
		// dataout = {};
		// dataout.time = [];
		// 
		// data.time = dataout.time.concat(res[0].value.time,Date.now());
		data.time = res[0].value.time,Date.now()
		console.log(data);
		db.save(res[0].id,res[0].value._rev,data,function(err,res) {
			if (err) console.log(err.error);
			
			
		});	
	}	else {
		data.time = Date.now();
		db.save(data,function(err,res) {
			if (err) throw err.error;
		});
	}	
};

exports.updateRadMarker = function(clientId) {
	db.view('radmarker/by_clientId',{
		key:clientId,
		limit:1,
	},function(err,res) {
		if (err) console.log(err.error);
		if (!res.length) return
		db.merge(res[0].id,{timeEnd:Date.now()},function(err,res) {
			if (err) console.log(err.error);
		});
	});
};


exports.getServerInfo = function(cb) {
	dbjc.view("searchparam/by_query_date",{},function(err,res) {
		if (err) throw err.error
    cb({data:res});
	});
};

exports.getDocData = function(docsid,cb) {
		console.time("getDocData CouchDB");
		var dataRes = {};
		db.get(docsid, function(err, res) {
		    if (err) throw err.error;
				res.sort();
				dataRes=res;
				console.timeEnd("getDocData CouchDB");
				cb(dataRes);
		});
};

exports.getSearchData = function(suggest,cb) {
	console.time("getSearchData CouchDB");
	db.view('Jobdata/by_searchdata', {
	    key: suggest,
		  group: true,
	}, function(err, res) {
	    if (err) throw err.error
			if (_.isEmpty(res)) return cb({noData:true});
			var dataRes = {};
      var dataTransp = {};
		  var flattenData = _.flatten(res[0].value);
			for (ids in flattenData) {
				dataTransp[flattenData[ids].id]= {lat:flattenData[ids].lat,lng:flattenData[ids].lng};
			};
			dataRes["couchid"]=dataTransp;
			console.timeEnd("getSearchData CouchDB");
			return cb(dataRes);
			});
};


exports.checkList = function(cb) {
	console.log("checkList");
	if (dataBuffer.value == 0) { 
	suggestList(function(data) {
		dataBuffer = data;
		cb(dataBuffer);
	});
  } else {
		cb(dataBuffer);
  }
};


suggestList = function(cb) {
	console.time("suggestList");
	db.view('Jobdata/by_jobcategories', {
	    group: true,
	}, function(err, res) {
	    if (err) throw err.error
			if (_.isEmpty(res)) return cb({noData:true});
			var dataRes = {};
			for (i in res) {
				dataRes[res[i].key]=res[i].value;
		  };
			dataBuffer = dataRes;
			cb(dataRes);
			console.timeEnd("suggestList");
	});	
};