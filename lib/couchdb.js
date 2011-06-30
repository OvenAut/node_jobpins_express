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



dbjc.info(function(err,res) {
	//dbUpdate_seq  =res.update_seq;
	dbjc.changes({since:res.update_seq}).on('response', function(res) {
		res.on('data',function(change) {
			  dbjc.get(change.id,change.changes[0].rev,function(err,res) {
					//var data = res.query
			  	if (res.lastsearch>res.lastround) {
						dbjcEvent.emit("sendChange",{data:res.query});
						//console.log("sendChange");
						//console.log(util.inspect(dbjcEvent,true,2));
						//console.log(dbjcEvent.listeners.length);
						var evArray = dbjcEvent.listeners("sendChange");
						if (evArray.length >1 ) evArray.pop();
					}
			  })
		});
	});
});

exports.events = dbjcEvent;

var db = connection.database('jobdata');

exports.getServerInfo = function(cb) {
	dbjc.view("searchparam/by_query_date",{},function(err,res) {
		if (err) throw err.error
    cb({data:res});
	});
};

exports.getDocData = function(docsid,cb) {
		console.time("getDocData CouchDB");
		//console.log(docsid);
		var dataRes = {};
		//for(key in docsid) { 
			//console.log(docsid[key]);
		db.get(docsid, function(err, res) {
		    if (err) throw err.error;
				//console.dir(res);
				//break
				res.sort();
				dataRes=res;
				//console.log(res);
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
			//console.dir(res);
			//break
			//suggestData = res;
			//console.dir(suggestData);
			if (_.isEmpty(res)) return cb({noData:true});
			var dataRes = {};
			//console.dir(res[0]);
			//for (i in res) {
      var dataTransp = {};
		  var flattenData = _.flatten(res[0].value);
			for (ids in flattenData)
			{
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
	// body...
	//console.log("function getSuggestList");
	db.view('Jobdata/by_jobcategories', {
	    group: true,
	}, function(err, res) {
	    if (err) throw err.error
			// console.dir(res);
			//suggestData = res;
			//console.dir(suggestData);
			if (_.isEmpty(res)) return cb({noData:true});
			//console.log("data get");
			var dataRes = {};
				
			for (i in res) {
				dataRes[res[i].key]=res[i].value;
		  };
			//console.dir(dataRes);
			// res = {
			// 	
			// 	key: res[0].key,
			// 	value:data
			// };
			//console.dir(res);
			//console.log(this);
			dataBuffer = dataRes;
			cb(dataRes);
			console.timeEnd("suggestList");
	});	
};