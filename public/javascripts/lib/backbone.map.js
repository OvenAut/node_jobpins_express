
window.MarkerCollection = Backbone.Collection.extend({
	
	
	initialize: function() {
		
	  this.bind("add",this.addNew);
	  Searches.bind('change:couchids',this.addMarkersChange);
	  Searches.bind('remove',this.addMarkers);
	  
	},
	map: {},
	infowindow:{},
	startPosition:{},
	shadow:{},
	
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
			//console.log("Marker counter " + counter);
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
	   this.shadow = new google.maps.MarkerImage('images/shadow.png',
			new google.maps.Size(22,12),
			new google.maps.Point(0,0),
			new google.maps.Point(2,17)
	
			);
		 //this.infowindow = new google.maps.InfoWindow();
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
	 },
	initialize: function() {
		Marker.start();
	 },
});