
/**
 * Module dependencies.
 */

var express    = require('express'),
    RedisStore = require('connect-redis'),
    app        = module.exports = express.createServer(),
    stylus     = require('stylus'),
    fs         = require('fs'),
    VERSION    = "0.3.2",
    store      = new RedisStore({host:'home.oszko.net'}),
    connect    = require('connect');
 
var io = require('socket.io');
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

// app.error(function(err, req, res, next){
//   res.send(err.message, 500);
// });

// Routes

app.get('/', function(req, res){
  res.render('index', {
    pageTitle: 'Jobpins ' + VERSION,
    title: 'Jobpins ',
    slogen: 'Find your job near you',
		jobs: {job1:'Job1',job2:'Job2',job4:'Job3',job4:'Job4',job5:'Job5',job6:'Job6',job7:'Job7'},
    sessionID: req.sessionID
  });
	//console.dir(req)
  //console.log(req.session.user)
  // if ( typeof req.session.user == "undefined") {
  //   req.session.user = "Test";
  // 		req.session.save();
  // }
  
  //else

});
// app.get('/404', function(req, res){
// 	res.statusCode = 404;
// 	res.write(fs.readFileSync(__dirname + '/public/404.html', 'utf8'));
// 	res.end()
// });
// 
// app.error(function(err, req, res, next){
//     if (err instanceof NotFound) {
//         res.render('404.jade');
//     } else {
//         next(err);
//     }
// });
// Only listen on $ node app.js

if (!module.parent) {
  app.listen(3000);
  console.log("Express server listening on port %d", app.address().port);
}

var socket = io.listen(app); 
socket.on('connection', function(client){ 
  	// … 
    //console.dir(client);
		//var cookie_string = client.request.headers.cookie;
		//var parsed_cookies = connect.utils.parseCookie(cookie_string);
		client.once('message', function(sid) {
			//console.log(parsed_cookies);
			//console.log(cookie_string);
			//console.log(sid);
			//var sida = {'connect.sid':sid.sid};
			//var sida = sid.sid;
			//console.log(sida)
			store.get(sid.sid, function(err ,session) {
				console.dir(session);
				console.log("store.get");
				if (err || !session) {
					console.log(err + " error");
				  return;
				}
				store.length(function(data) {
					console.dir(data);
				}); 
			
			client.on('message', function(message) {
				console.dir(session + ' message')
			});	
			}); 
		});
			// body...
});

//   	console.log(socket.transport.sessionid);
// })