
/**
 * Module dependencies.
 */

var express    = require('express'),
    RedisStore = require('connect-redis'),
    app        = module.exports = express.createServer(),
    stylus     = require('stylus'),
    fs         = require('fs'),
    VERSION    = "0.3.2";

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
  app.use(express.session({ secret: 'your keyboard cat secret here',store:new RedisStore({host:'home.oszko.net'}) }));
  app.use(stylus.middleware({ src: __dirname + '/public', compile: compile }));
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
		jobs: {job1:'Job1',job2:'Job2',job4:'Job3',job4:'Job4',job5:'Job5',job6:'Job6',job7:'Job7'}
  });

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
