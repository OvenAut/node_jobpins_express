
/**
 * Module dependencies.
 */

var express    = require('express'),
    RedisStore = require('connect-redis'),
    app        = module.exports = express.createServer(),
    stylus     = require('stylus'),
    fs         = require('fs'),
    VERSION    = "0.3.3",
    //store      = new RedisStore({host:'home.oszko.net',pass:'webcat'}),
    connect    = require('connect'),
    util       = require('util'),
    io         = require('socket.io'),
    helper     = require('helper'),
    couchdb    = require('couchdb');

//var sws = require("./sws.js"); 



function compile(str, path) {
      return stylus(str)
        //.import(__dirname + '/public/stylesheets/import/media_boilerplatte.css')
        //.import(__dirname + '/css/mixins/css3')
        .set('filename', path)
        //.set('warn', true)
        .set('compress', true);
    }

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.favicon(__dirname + '/public/favicon.ico'));
  //app.use(express.cookieParser());
  //app.use(express.session({ secret: 'your keyboard cat secret here',store:store }));
  app.use(stylus.middleware({ src: __dirname + '/public', compile: compile }));
//  app.use(sws.http);
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
	//   app.use(require('browserify')({
	//         base: __dirname + '/public/javascripts',
	//         mount : '/browserify.js'        
	// }));
  //app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
});

couchdb.checkList(function() {});



app.get('/', function(req, res){
	console.time("GET /");
  res.render('index', {
    pageTitle: 'Jobpins ' + VERSION,
    title: 'Jobpins ',
    slogen: 'Find your job near you',
		jobs: {job1:'Job1',job2:'Job2',job4:'Job3',job4:'Job4',job5:'Job5',job6:'Job6',job7:'Job7'},
    //sessionID: req.sessionID
  });
  //Datum= " + (new Date()).toString() + "\n
	helper.showAgent(req);
  //console.log(req.session.user)
  // if ( typeof req.session.start == "undefined") {
  //    req.session.start = Date.now();
  // 		 req.session.counter = 0;
  //  		req.session.save();
  // }
	
  //else
  console.timeEnd("GET /");
});


app.get('/test', function(req,res) {
	console.time('GET /test');
	couchdb.checkList(function(data) {
		res.send(data);
		console.timeEnd('GET /test');
	  
	});
	
	//console.log(dataBuffer);
	//dataBuffer = data;	
});



if (!module.parent) {
  app.listen(3000);
  console.log("Express server listening on port %d", app.address().port);
}


function storeGet(message,cb) {
	var self = this;
	
	store.get(message.sid, function(err ,session) {
		if (err || !session) {
 			throw err;
		}
		
		return cb(session);
  }); 			
};

function storeSet(message,session) {

	store.set(message.sid, session, function(err) {
		if (err) throw err;
		console.log("session saved");	
	});			
};


// SOCKET
var socket = io.listen(app);

socket.on('connection', function(client){ 
  	// … 
    //console.dir(client);
		//var cookie_string = client.request.headers.cookie;
		//var parsed_cookies = connect.utils.parseCookie(cookie_string);
		// client.once('message', function(message) {
		// 	console.log('once.message')
		// 	//console.log(parsed_cookies);
		// 	//console.log(cookie_string);
		// 	//console.log(sid);
		// 	//var sida = {'connect.sid':sid.sid};
		// 	//var sida = sid.sid;
		// 	//console.log(sida)    
		// 	// storeGet(message,function(session) {
		// 	// 	//console.dir(this);
		// 	// 	//console.dir(message);
		// 	// 	session.counter+=1;
		// 	// 		    session.data = message.data;
		// 	// 	
		// 	// 	client.sid = message.sid;
		// 	// 	//console.dir(session);
		// 	// 	
		// 	// 	storeSet(message,session);
		// 	// 					
		// 	// });
		// 
		// });

		client.on('message', function(message) {
			var self = this;
			console.time('on.message');
		  //console.dir(message)
			//helper.time.start();
			function dataSend(name,data,id) {
						var dataSend = {};
					//	console.log('sendingdata');
						dataSend[name] = {data:data,id:id};
						client.send(dataSend);
					 //console.dir(dataSend);
					//console.log(helper.time.stop() + "socket.message");
				 console.timeEnd('on.message');

				
			};
			
			
		  if (typeof message.data.suggest !== "undefined" && message.data.suggest !== null) {
			
				//console.dir(this);
				//storeGet(message, function() {
						//console.dir(this);
					couchdb.suggest(message.data.suggest, function(data) {
						//console.dir(data);
					dataSend("suggest",data);
					});					
				
					  //data.
				//});
		  }
			if (typeof message.data.getSearchData !== "undefined" && message.data.getSearchData !== null) {
				couchdb.getSearchData(message.data.getSearchData.key,function(data) {
					dataSend("searchData",data,message.data.getSearchData.id);
				});
			}
			
			if (typeof message.data.getDocData !== "undefined" && message.data.getDocData !== null) {
				//console.dir(message.data.getDocData);
				couchdb.getDocData(message.data.getDocData.key,function(data) {
					dataSend("docData",data,message.data.getDocData.id);
				});
			}
			
		});	
		
});


socket.on('clientDisconnect',function(client) {
	
	// storeGet(client,function(session) {
	// 	session.disconnect = Date.now();
	// 	storeSet(client, session);
	// });
	
});

socket.on('clientConnect',function(client) {
		console.log("ClientConnect");
		couchdb.checkList(function(data) {
				client.send({suggestList:data});
		});
		
	// storeGet(client,function(session) {
	// 	session.disconnect = Date.now();
	// 	storeSet(client, session);
	// });
	
});