$(document).ready(function() {
	
  //initialSocket();
	socket.connect();

/**
	Google Map
**/	

  //initializeMap(); //map	
  //window.Map = new MapView;
	window.App = new AppView;
	window.Controller = new restfulApp;
		//Initiate a new history and controller class
		Backbone.emulateHTTP = true;
		Backbone.emulateJSON = true 
		Backbone.history.start();
});

// var query = require('./jquery-1.6.min');
//      undercore = require('./underscore'),
//      BackboneLoad = require('./backbone.min'),
//      BackboneLocalStorageLoad = require('./backbone.localStorage');

// var	data = {},
// 		hm = false,
// 		tmpval= "",
// 		nodata=false; 
// Solution to Part 1.

// Function.prototype.cached = function(){
//   var self = this, cache = {};
//   return function(arg){
//     if(arg in cache) return cache[arg];
//     return cache[arg] = self(arg);
//   }
// }
// 
// // A tracing version:
// 
// Function.prototype.cachedTrac = function(){
//   var self = this, cache = {};
//   return function(arg){
//     if(arg in cache) {
//       console.log('Cache hit for '+arg);
//       return cache[arg];
//     } else {
//       console.log('Cache miss for '+arg);
//       return cache[arg] = self(arg);
//     }
//   }
// }


//	console.dir(sending);
//	console.log("sending");


//query();



// function socketSend(data) {
//   socket.send({
// 		sid:  connect.sid,
// 		data: data		
// 		});	
// }

// function log() {
// 	return console.log(arguments);
// }

