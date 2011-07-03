
window.MarkerCollection = Backbone.Collection.extend({
	
	localStorage: new Store("marker"),
	
	
	initialize: function() {
		_.bindAll(this,'changeCursorMode');
	  this.bind("add",this.addNew);
	  Searches.bind('change:couchids',this.addMarkersChange);
	  Searches.bind('remove',this.addMarkers);
	  $('.circleMap').bind('click' ,this.changeCursorMode);
		
	},
	map: {},
	infowindow:{},
	startPosition:{},
	shadow:{},
	radiusMode:{
		ac:{html:'<img width="48" height="48" src="images/circleMapAc.png" alt="Circle" title="Radius Mode Activ">'},
		deac:{html:'<img width="48" height="48" src="images/circleMapAc2.png" alt="Circle" title="Radius Mode Deactiv">'},
		status:false
	},
  mapEvent:{},
	routeCircles:[],
	mapRadiusMarker:{
		radius:0,
		center:{}},
	
	
	addMarkersChange: function() {
		Marker.addMarkers(false);
	},
	
	changeCursorMode: function(event) {
		var html;
		this.radiusMode.status?html = this.radiusMode.deac.html:html = this.radiusMode.ac.html;
		$('.circleMap').html(html);
		this.radiusMode.status = !this.radiusMode.status;
		this.radiusMode.status?this.addMapListener(this):this.removeMapListerner(this);
		
	},	
	
	addMarkers: function(check) {

		Marker.deleteOverlays(function(self) {
		if (Marker.models.length >= 1) {
			var marker = Marker.first().attributes;
			var location = new google.maps.LatLng(marker.center.Ia, marker.center.Ja);
			if (typeof check != 'boolean') check = false;
			var distanceWidget = new DistanceWidget(self.map,location,marker.radius,self,check);
		}	
		Searches.each(function(data) {
				var jobs = data.attributes.couchids;
				var dataKeys = _.keys(jobs);
				dataKeys.sort();
					var categories = encodeURIComponent(data.attributes.content);
				var color = data.attributes.color;
				for (id in jobs) {
					var index = _.indexOf(dataKeys,id,true);
					Marker.addMarker(jobs[id].lat,jobs[id].lng,color,jobs[id],index,categories,id);
				};				
			});
		});
	},
	googleMaps: google.maps,

	start: function() {
		 this.startPosition = new google.maps.LatLng(48.208174,16.373819);
	   var myOptions = {
	     zoom: 11,
	     center: this.startPosition,
	     mapTypeId: google.maps.MapTypeId.ROADMAP,
			//draggableCursor:'crosshair'
	   };
	   this.map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);
	   this.shadow = new google.maps.MarkerImage('images/shadow.png',
			new google.maps.Size(22,12),
			new google.maps.Point(0,0),
			new google.maps.Point(2,17)
	
			);
	},
	
	addMapListener: function(self) {
		
		
		self.map["draggableCursor"] ='crosshair';
		
		if (Marker.models.length <= 0)
		this.mapEvent = this.googleMaps.event.addListener(self.map, 'click', function(event) {
				var check = true;
				var distanceWidget = new DistanceWidget(self.map,event.latLng,5,self,check);
		});
		
	this.addMarkers(true)
	},
	
	
	
	removeMapListerner: function(self) {
			
		
		//console.log(this.mapEvent);
		this.saveMarkerRadius()
		//var savemar = new SaveMarker(this);
		
			this.addMarkers(false)
			delete self.map.draggableCursor
			
			
			if (this.mapEvent.hasOwnProperty('prop')) {
			this.googleMaps.event.removeListener(this.mapEvent);
		}
		//this.map.setCursor('hand')
	},
	
	saveMarkerRadius: function() {
		// console.log("save")
		// console.log(self)
		// console.log(Marker.mapRadiusMarker);

		if (Marker.models.length > 0) {
			var last = Marker.last();
				last.attributes.center = Marker.mapRadiusMarker.center;
				last.attributes.radius = Marker.mapRadiusMarker.radius;
			last.save();

		} else {
	  Marker.create(Marker.mapRadiusMarker);
		}
	},
	
  markersArray: [],

  addMarker: function(lat,lng,color,model,counter,categories,id) {
  var location = new google.maps.LatLng(lat, lng);
  color = color.replace('#','');
  var image = 'http://dev.oszko.net/images/' + color + 'marker.png';

  marker = new google.maps.Marker({
    position: location,
    map: this.map,
    icon: image,
    title:model.company || "",
    id:id,
    shadow:this.shadow,
  });
  marker = this.addListener(marker,model,counter,this,categories);
  
  this.markersArray.push(marker);
 },

 addListener: function(marker,model,counter,self,categories) {
	if (model.company && false ) {
	google.maps.event.addListener(marker, 'mouseover', function() {
			var content = model.company;
			self.infowindow.setContent(content);
			self.infowindow.open(self.map,marker);
	  });
		google.maps.event.addListener(marker, 'mouseout', function() {
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
		return marker.id == couchid;
	});
	this.map.panTo(selectedMarker.getPosition());
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
	// console.log("deleteOverlays");
	// console.log(this.markersArray);
	  if (this.markersArray && this.markersArray.length>0) {
	    for (i in this.markersArray) {
	      this.markersArray[i].setMap(null);
	    }
	    this.markersArray.length = 0;
	    return cb(this);
	  }
	cb(this);
	},
});

window.Marker = new MarkerCollection;



window.MapView = Backbone.View.extend({
  el: $("#map_canvas"),

	events: {	
	 },
	initialize: function() {
		Marker.start();
	 },
});



// function SaveMarker(self) {
// 	console.log("save")
// 	console.log(self)
// 	console.log(Marker.mapRadiusMarker);
// 	
// 	if (Marker.models.length > 0) {
// 		var last = Marker.last();
// 			last.attributes.center = Marker.mapRadiusMarker.center;
// 			last.attributes.radius = Marker.mapRadiusMarker.radius;
// 		last.save();
// 		
// 	} else {
//   Marker.create(Marker.mapRadiusMarker);
// 	}
// }




function DistanceWidget(map, center, radius, self,check) {
	  var liColor =  "#0000FF";
	  var liWidth = 1;
	  var fillColor = "#0000FF";
	  var liOpa = 1;
    this.set('map', map);
    this.set('position',center);
      
    var image = new google.maps.MarkerImage('images/radmarker.png',
    // This marker is 20 pixels wide by 32 pixels tall.
    new google.maps.Size(20, 34),
    // The origin for this image is 0,0.
    new google.maps.Point(0,0),
    // The anchor for this image is the base of the flagpole at 0,32.
    new google.maps.Point(10, 33));
    var shadow = new google.maps.MarkerImage('images/radmarkershadow.png',
    new google.maps.Size(28, 22),
    new google.maps.Point(0,0),
    new google.maps.Point(1, 22));
    
		//var check = true;
		if (check) {
	    var marker = new google.maps.Marker({
	      draggable: true,
	      title: 'Drag me!',shadow:shadow,icon:image
	    });
	    // Bind the marker map property to the DistanceWidget map property
	    marker.bindTo('map', this);
	    marker.bindTo('position', this);
		 self.markersArray.push(marker);
		}


    // Create a new radius widget
    
    var radiusWidget;
    
    //if the opacity is clear "#0" then use zero
    radiusWidget= new RadiusWidget(center, radius, liColor, liWidth, liOpa, fillColor, 0.2,self,check);
    // Bind the radiusWidget map to the DistanceWidget map
    radiusWidget.bindTo('map', this);

    // Bind the radiusWidget center to the DistanceWidget position
    radiusWidget.bindTo('center', this, 'position');

    // Bind to the radiusWidgets' distance property
    this.bindTo('distance', radiusWidget);

    // Bind to the radiusWidgets' bounds property
    this.bindTo('bounds', radiusWidget);

  
}




DistanceWidget.prototype = new google.maps.MVCObject();

DistanceWidget.prototype.position_changed = function() {
    var position = this.get('position');
//console.log(position);
		Marker.mapRadiusMarker.center = position;
}



function RadiusWidget(center, radius, liColor, liWidth, liOpa, fillColor, fillOpa,self,check) {
						//             console.log("RadiusWidget");
						// console.log(this);
						// console.log(self);
						
		
    var circle = new google.maps.Circle({
          center: center,
          map: this.map,
          radius: radius*1000,
          strokeColor: liColor,
          strokeWeight: liWidth,
          strokeOpacity: liOpa,
          fillColor: fillColor,
          clickable: false,
          fillOpacity: fillOpa
    });
    
    self.markersArray.push(circle);
     
    // Set the distance property value, default to 50km.  Changed to 402km or ~ 250 miles
    this.set('distance', radius);

    // Bind the RadiusWidget bounds property to the circle bounds property.
    this.bindTo('bounds', circle);

    // Bind the circle center to the RadiusWidget center property
    circle.bindTo('center', this);

    // Bind the circle map to the RadiusWidget map
    circle.bindTo('map', this);

    // Bind the circle radius property to the RadiusWidget radius property
    circle.bindTo('radius', this);

    // Add the sizer marker
    //check=true //document.getElementById("showgrip").checked;
    if (check)
    {
        this.addSizer_();       
    }
    
}


RadiusWidget.prototype = new google.maps.MVCObject();

RadiusWidget.prototype.distance_changed = function() {
    this.set('radius', this.get('distance') * 1000);
		Marker.mapRadiusMarker.radius = this.get('distance');
		// console.log(Marker.mapRadiusMarker.radius);
};


RadiusWidget.prototype.addSizer_ = function() {
    var sizer = new google.maps.Marker({
        draggable: true,
        title: 'Drag me!',
        icon: new google.maps.MarkerImage('images/resize.png')
    });

    sizer.bindTo('map', this);
    sizer.bindTo('position', this, 'sizer_position');

    var me = this;
    google.maps.event.addListener(sizer, 'drag', function() {
      // Set the circle distance (radius)
      me.setDistance();
     // console.log(me);
    });
};

RadiusWidget.prototype.center_changed = function() {
    var bounds = this.get('bounds');

    // Bounds might not always be set so check that it exists first.
    if (bounds) {
      var lng = bounds.getNorthEast().lng();

      // Put the sizer at center, right on the circle.
      var position = new google.maps.LatLng(this.get('center').lat(), lng);
      this.set('sizer_position', position);
    }
    // Change - 04/08/2011
    // After setting the new position, clear the old Markers from the Map
    // if (self.map.markers)
    // {
    //     map.clearMarkers();
    // }

};
 
RadiusWidget.prototype.distanceBetweenPoints_ = function(p1, p2) {
    if (!p1 || !p2) {
      return 0;
    }

    var R = 6371; // Radius of the Earth in km
    var dLat = (p2.lat() - p1.lat()) * Math.PI / 180;
    var dLon = (p2.lng() - p1.lng()) * Math.PI / 180;
    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(p1.lat() * Math.PI / 180) * Math.cos(p2.lat() * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c;
    return d;
   //console.log("distanceBetweenPoints_ " + d);
};

RadiusWidget.prototype.setDistance = function() {
    // As the sizer is being dragged, its position changes.  Because the
    // RadiusWidget's sizer_position is bound to the sizer's position, it will
    // change as well.
    var pos = this.get('sizer_position');
    var center = this.get('center');
    var distance = this.distanceBetweenPoints_(center, pos);

    // Set the distance property for any objects that are bound to it
    this.set('distance', distance);
};