// var query = require('./jquery-1.6.min');
//      undercore = require('./underscore'),
//      BackboneLoad = require('./backbone.min'),
//      BackboneLocalStorageLoad = require('./backbone.localStorage');

var	data = {},
		hm = false,
		tmpval= "",
		nodata=false; 


//	console.dir(sending);
//	console.log("sending");


//query();

function initializeMap() {
    var latlng = new google.maps.LatLng(48.208174,16.373819);
    var myOptions = {
      zoom: 11,
      center: latlng,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    var map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);
  };


// function socketSend(data) {
//   socket.send({
// 		sid:  connect.sid,
// 		data: data		
// 		});	
// }

// function log() {
// 	return console.log(arguments);
// }

$(document).ready(function() {
  //initialSocket();
	socket.connect();

/**
	Google Map
**/	

//  initializeMap(); //map	

	window.App = new AppView;
			
});