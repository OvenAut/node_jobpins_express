/**
 * Module dependencies.
 */

var express    = require('express'),
    RedisStore = require('connect-redis'),
    app        = module.exports = express.createServer(),
    stylus     = require('stylus'),
    fs         = require('fs'),
    VERSION    = "0.3.5",
    //store      = new RedisStore({host:'home.oszko.net',pass:'webcat'}),
    connect    = require('connect'),
    util       = require('util'),
    helper     = require('helper'),
    couchdb    = require('./lib/couchdb.js');


function compile(str, path) {
      return stylus(str)
        .set('filename', path)
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



app.get('/', function(req, res){
	console.time("GET /");
	couchdb.checkList(function() {});
  res.render('index', {
    pageTitle: 'Jobpins ' + VERSION,
    title: 'Jobpins ',
    slogen: 'Find your job near you',
		//jobs: {job1:'Job1',job2:'Job2',job4:'Job3',job4:'Job4',job5:'Job5',job6:'Job6',job7:'Job7'},
    //sessionID: req.sessionID
  });
	helper.showAgent(req);
  console.timeEnd("GET /");
});

app.get('/impressum', function(req, res){
	console.time("GET /Impressum");
	
  res.render('impressum', {
    pageTitle: 'Jobpins ' + VERSION,
    title: 'Jobpins ',
    slogen: 'Find your job near you',
		//jobs: {job1:'Job1',job2:'Job2',job4:'Job3',job4:'Job4',job5:'Job5',job6:'Job6',job7:'Job7'},
    //sessionID: req.sessionID
  });
	//helper.showAgent(req);
  console.timeEnd("GET /Impressum");
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

var io = require('socket.io').listen(app);
io.configure(function () {
  io.set('transports', ['flashsocket', 'xhr-polling']);
});


io.enable('browser client minification');
io.set('log level',1);

io.sockets.on('connection', function(client){ 
		
	client.on('getSuggestList' ,function() {
		couchdb.checkList(function(data) {
				client.emit("suggestList",data);
		});
	});

	client.on('getSearchData',function(data) {
		couchdb.getSearchData(data.key,function(datadb) {
			client.emit("searchData",{data:datadb,id:data.id});
		});	
	});

	client.on('getDocData',function(data) {
		couchdb.getDocData(data.key,function(datadb) {
			client.emit("docData",{data:datadb,id:data.id});
		});
	});

	client.on("getServerInfo",function() {
		couchdb.getServerInfo(function(datadb) {
			client.emit("ServerInfo",datadb);
		});
	});
	client.on('radMarker',function(data) {
		data.clientId = client.id;
		couchdb.saveradMarker(data);
	});

	couchdb.events.on("sendChange",function (change) {
		if (!client.disconnected) client.emit('newests',change.data);
	});

	client.on('disconnect',function() {
	  couchdb.updateRadMarker(client.id);
 });
});