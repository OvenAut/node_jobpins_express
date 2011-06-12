$(document).ready(function() {
	
function initializeMap() {
    var latlng = new google.maps.LatLng(48.208174,16.373819);
    var myOptions = {
      zoom: 11,
      center: latlng,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    var map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);
  };

	
  //initialSocket();
	socket.connect();

/**
	Google Map
**/	

  //initializeMap(); //map	

	window.App = new AppView;
			
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

