
window.MarkerCollection = Backbone.Collection.extend({
	
	
	initialize: function() {
		
	  this.bind("add",this.addNew);
	  Searches.bind('change:couchids',this.addMarkersChange);
	  Searches.bind('remove',this.addMarkers);
	  //Searches.bind('change:docOpen', this.gotoMarker);
	 // Searches.bind('fetch',this.addMarkers);
	  
	},
	map: {},
	infowindow:{},
	startPosition:{},
	// addSearch: function(search) {
	//  // search.model.	get lng l
	// //console.log("addSearch");
	// return;
	// //console.log(search);
	// var data = search.attributes;
	// var color = data.color;
	// if (this.markersArray.length>0) this.deleteOverlays();
	// var counter = 0;
	// var couchids = data.couchids;
	// var dataKeys = _.keys(jobs);
	// dataKeys.sort();
	// 
	// for (id in couchids) {
	// 	var index = _.indexOf(dataKeys,id,true);
	// 	var lat = couchids[id].lat;
	// 	var lng = couchids[id].lng;
	// 	this.addMarker(lat,lng,color,couchids[id],index);
	// 	counter++;
	// }
	// },
	// addNew: function() {
	// 	console.log("ADDNEW");
	// },
	
	addMarkersChange: function() {
	//	console.log("addMarkersChange");
		Marker.addMarkers();
	},
	
	
	addMarkers: function() {
		//console.log("	addMarker");
		var counter = 0;
		Marker.deleteOverlays(function() {
			Searches.each(function(data) {
				//Marker.start();
				var jobs = data.attributes.couchids;
				var dataKeys = _.keys(jobs);
				dataKeys.sort();
					var categories = encodeURIComponent(data.attributes.content);
				var color = data.attributes.color;
				for (id in jobs) {
				
					//console.log("index");
					//console.log(dataKeys);// + " " +jobs[id] + " " + id)
					var index = _.indexOf(dataKeys,id,true);
					Marker.addMarker(jobs[id].lat,jobs[id].lng,color,jobs[id],index,categories,id);
					counter++;
				};

			});
			console.log("Marker counter " + counter);
		});
	},
	

	start: function() {
		 this.startPosition = new google.maps.LatLng(48.208174,16.373819);
	   var myOptions = {
	     zoom: 11,
	     center: this.startPosition,
	     mapTypeId: google.maps.MapTypeId.ROADMAP
	   };
	   this.map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);
	
		 this.infowindow = new google.maps.InfoWindow();
	},
  markersArray: [],

  addMarker: function(lat,lng,color,model,counter,categories,id) {
  var location = new google.maps.LatLng(lat, lng);
  color = color.replace('#','');
  var image = 'http://dev.oszko.net/images/' + color + 'marker.png';
  //console.log(image);
  marker = new google.maps.Marker({
    position: location,
    map: this.map,
    icon: image,
    title:model.company || "",
    id:id,
  });
  marker = this.addListener(marker,model,counter,this,categories);
  this.markersArray.push(marker);
 },

 addListener: function(marker,model,counter,self,categories) {
	//console.log("model");
	//console.log(model);
  //console.log(categories);
	if (model.company && false ) {
	google.maps.event.addListener(marker, 'mouseover', function() {
	    //window.location.href("/#");
	    //window.location.href = "/#";
			var content = model.company;
			// console.log("event moueup");
			// console.log(self.infowindow);
			// 		  console.log(this);
			self.infowindow.setContent(content);
			self.infowindow.open(self.map,marker);
	  });
		google.maps.event.addListener(marker, 'mouseout', function() {
		    //window.location.href("/#");
		    //window.location.href = "/#";
				// var content = model.company;
				// console.log("event moueup");
				// console.log(self.infowindow);
				// 			  console.log(this);
				// self.infowindow.setContent(content);
				self.infowindow.close();
		  });
	};
	
	google.maps.event.addListener(marker, 'click', function() {
	    //window.location.href("/#");
	    window.location.href = "/#!/categories/" + categories +"/" +counter;
			
	  });
 	return marker;
 },
 zoomWien: function() {
 	this.map.setCenter(this.startPosition);
  this.map.setZoom(11);
 },
 
 gotoMarker: function(couchid) {
	selectedMarker = _.detect(this.markersArray,function(marker) {
		//console.log(marker.id);
		//console.log(couchid);
		return marker.id == couchid;
	});
	this.map.panTo(selectedMarker.getPosition());

 	//console.log("gotoMarker");
  //console.log(couchid.lat);
  //var latlng = new google.maps.LatLng(couchid.lat,couchid.lng);
	//this.map.panTo(latlng);
	this.map.setZoom(16);
 },
 
// Removes the overlays from the map, but keeps them in the array
  clearOverlays:function() {
    if (this.markersArray) {
		  for (i in this.markersArray) {
		    this.markersArray[i].setMap(null);
		  }
		}
  },

// Shows any overlays currently in the array
  showOverlays:function() {
	  if (this.markersArray) {
	    for (i in this.markersArray) {
	      this.markersArray[i].setMap(map);
	    }
	  }
	},

// Deletes all markers in the array by removing references to them
  deleteOverlays:function (cb) {
	  if (this.markersArray && this.markersArray.length>0) {
	    for (i in this.markersArray) {
	      this.markersArray[i].setMap(null);
	    }
	    this.markersArray.length = 0;
	    return cb();
	  }
	cb();
	},
});
window.Marker = new MarkerCollection;



window.MapView = Backbone.View.extend({
  el: $("#map_canvas"),
	events: {
		// "keypress #new-search": "createOnEnter",
		// "keyup #new-search":  "enterVal", // "showTooltip",
		// "dblclick div.suggest-content": "createOnEnter",
		//
		//"click .search-clear a": "clearCompleted"
	},
	
	//At initialization we bind to the relevant events on the Todos collection, 
	//when items are added or changed. Kick things off by loading any 
	//preexisting todos that might be saved in localStorage.
	// 	});
	// window.blabla = ({
	
	initialize: function() {
		Marker.start();
		// _.bindAll(this, 'addOne', 'addAll', 'renderSuggestList','enterVal');
		// 
		// this.input = this.$("#new-search");
		// 
		// Searches.bind('add',     this.addOne);
		// Searches.bind('refresh', this.addAll);
		// Suggests.bind('refresh', this.renderSuggestList);
		// Suggests.bind('change', this.renderSuggestList);
		// 
		// //SuggestSelected.bind('all',this.clearSuggest)
		// //Searches.bind('all',     this.render);
		// //Searches.bind('socket',  this.giveName);
		// //Searches.bind('showSuggest', this.showSuggest)
		// //SuggestList.bind('add', this.renderSuggestList);
		// Searches.fetch();
		// window.DocumentList = new DocumentListCollection;
		// this.showDoc();
		// //this.render();
		
	},
			
});

/*

function initialize() {
  var myOptions = {
    zoom: 10,
    center: new google.maps.LatLng(-33.9, 151.2),
    mapTypeId: google.maps.MapTypeId.ROADMAP
  }
  var map = new google.maps.Map(document.getElementById("map_canvas"),
                                myOptions);

  setMarkers(map, beaches);
}

/**
 * Data for the markers consisting of a name, a LatLng and a zIndex for
 * the order in which these markers should display on top of each
 * other.
 */

/**
var beaches = [
  ['Bondi Beach', -33.890542, 151.274856, 4],
  ['Coogee Beach', -33.923036, 151.259052, 5],
  ['Cronulla Beach', -34.028249, 151.157507, 3],
  ['Manly Beach', -33.80010128657071, 151.28747820854187, 2],
  ['Maroubra Beach', -33.950198, 151.259302, 1]
];

function setMarkers(map, locations) {
  // Add markers to the map

  // Marker sizes are expressed as a Size of X,Y
  // where the origin of the image (0,0) is located
  // in the top left of the image.

  // Origins, anchor positions and coordinates of the marker
  // increase in the X direction to the right and in
  // the Y direction down.
  var image = new google.maps.MarkerImage('images/beachflag.png',
      // This marker is 20 pixels wide by 32 pixels tall.
      new google.maps.Size(20, 32),
      // The origin for this image is 0,0.
      new google.maps.Point(0,0),
      // The anchor for this image is the base of the flagpole at 0,32.
      new google.maps.Point(0, 32));
  var shadow = new google.maps.MarkerImage('images/beachflag_shadow.png',
      // The shadow image is larger in the horizontal dimension
      // while the position and offset are the same as for the main image.
      new google.maps.Size(37, 32),
      new google.maps.Point(0,0),
      new google.maps.Point(0, 32));
      // Shapes define the clickable region of the icon.
      // The type defines an HTML <area> element 'poly' which
      // traces out a polygon as a series of X,Y points. The final
      // coordinate closes the poly by connecting to the first
      // coordinate.
  var shape = {
      coord: [1, 1, 1, 20, 18, 20, 18 , 1],
      type: 'poly'
  };
  for (var i = 0; i < locations.length; i++) {
    var beach = locations[i];
    var myLatLng = new google.maps.LatLng(beach[1], beach[2]);
    var marker = new google.maps.Marker({
        position: myLatLng,
        map: map,
        shadow: shadow,
        icon: image,
        shape: shape,
        title: beach[0],
        zIndex: beach[3]
    });
  }
}

var map;
var markersArray = [];

function initialize() {
  var haightAshbury = new google.maps.LatLng(37.7699298, -122.4469157);
  var mapOptions = {
    zoom: 12,
    center: haightAshbury,
    mapTypeId: google.maps.MapTypeId.TERRAIN
  };
  map =  new google.maps.Map(document.getElementById("map_canvas"), mapOptions);

  google.maps.event.addListener(map, 'click', function(event) {
    addMarker(event.latLng);
  });
}
  
function addMarker(location) {
  marker = new google.maps.Marker({
    position: location,
    map: map
  });
  markersArray.push(marker);
}

// Removes the overlays from the map, but keeps them in the array
function clearOverlays() {
  if (markersArray) {
    for (i in markersArray) {
      markersArray[i].setMap(null);
    }
  }
}

// Shows any overlays currently in the array
function showOverlays() {
  if (markersArray) {
    for (i in markersArray) {
      markersArray[i].setMap(map);
    }
  }
}

// Deletes all markers in the array by removing references to them
function deleteOverlays() {
  if (markersArray) {
    for (i in markersArray) {
      markersArray[i].setMap(null);
    }
    markersArray.length = 0;
  }
}
*/