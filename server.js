
/**
 * Module dependencies.
 */

var express    = require('express'),
    RedisStore = require('connect-redis'),
    app        = module.exports = express.createServer(),
    stylus     = require('stylus'),
    fs         = require('fs'),
    VERSION    = "0.3.2",
    store      = new RedisStore({host:'home.oszko.net',pass:'webcat'}),
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
  app.use(express.cookieParser());
  app.use(express.session({ secret: 'your keyboard cat secret here',store:store }));
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
  res.render('index', {
    pageTitle: 'Jobpins ' + VERSION,
    title: 'Jobpins ',
    slogen: 'Find your job near you',
		jobs: {job1:'Job1',job2:'Job2',job4:'Job3',job4:'Job4',job5:'Job5',job6:'Job6',job7:'Job7'},
    sessionID: req.sessionID
  });
  //Datum= " + (new Date()).toString() + "\n
	helper.showAgent(req);
  //console.log(req.session.user)
  if ( typeof req.session.start == "undefined") {
     req.session.start = Date.now();
		 req.session.counter = 0;
   		req.session.save();
  }
	
  //else

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
		client.once('message', function(message) {
			console.log('once.message')
			//console.log(parsed_cookies);
			//console.log(cookie_string);
			//console.log(sid);
			//var sida = {'connect.sid':sid.sid};
			//var sida = sid.sid;
			//console.log(sida)    
			storeGet(message,function(session) {
				//console.dir(this);
				//console.dir(message);
				session.counter+=1;
		    session.data = message.data;
				
				client.sid = message.sid;
				//console.dir(session);
				
				storeSet(message,session);
								
			});
		
		});

		client.on('message', function(message) {
			var self = this;
			console.log('on.message')
			console.dir(message)
			
		  if (typeof message.data.suggest !== "undefined" && message.data.suggest !== null) {
			
				//console.dir(this);
				storeGet(message, function() {
						//console.dir(this);
					couchdb.suggest(message.data.suggest, function(data) {
						var dataSend = {};
						console.log('sendingdata');
						dataSend['suggest'] = data;
						client.send(dataSend);
					  //console.dir(data);	
					});
					  //data.
				});
		  }	
		});	
		
});


socket.on('clientDisconnect',function(client) {
	
	storeGet(client,function(session) {
		session.disconnect = Date.now();
		storeSet(client, session);
	});
	
});