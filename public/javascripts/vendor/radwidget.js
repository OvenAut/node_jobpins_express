

function DistanceWidget(map, center, radius, self,check) {
	//console.log("DistanceWidget");
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
		if (check  || true) {
	    var marker = new google.maps.Marker({
	      draggable: true,
	      title: 'Drag me!',shadow:shadow,icon:image,
	      id: 1
	    });
	    // Bind the marker map property to the DistanceWidget map property
	    marker.bindTo('map', this);
	    marker.bindTo('position', this);
		 self.markersArray.push(marker);
		}


    // Create a new radius widget
    
    var radiusWidget;
    
    //if the opacity is clear "#0" then use zero
    radiusWidget= new RadiusWidget(center, radius, liColor, liWidth, liOpa, fillColor, 0.1,self,check);
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
		
		var objKeys = Object.keys(position)
		//console.log(Object.keys(position))
		// console.log(position[objKeys[0]])
		// console.log(position[objKeys[1]])
		// 
		// console.log(Marker.mapRadiusMarker.center)
		Marker.mapRadiusMarker.center.lat = position[objKeys[0]];
		Marker.mapRadiusMarker.center.lng = position[objKeys[1]];
		
		Marker.saveMarkerRadius()
}



function RadiusWidget(center, radius, liColor, liWidth, liOpa, fillColor, fillOpa,self,check) {
						//             console.log("RadiusWidget");
						// console.log(this);
						// console.log(self);
						
		
    var circle = new google.maps.Circle({
          center: center,
          map: self.map,
          radius: radius*1000,
          strokeColor: liColor,
          strokeWeight: liWidth,
          strokeOpacity: liOpa,
          fillColor: fillColor,
          clickable: false,
          fillOpacity: fillOpa,
					id:3
    });
    
    self.markersArray.push(circle);
     
    // Set the distance property value, default to 50km.  Changed to 402km or ~ 250 miles
    this.set('distance', radius);

    // Bind the RadiusWidget bounds property to the circle bounds property.
    this.bindTo('bounds', circle);

    // Bind the circle center to the RadiusWidget center property
    circle.bindTo('center', this);

    // Bind the circle map to the RadiusWidget map
    //circle.bindTo('map', this);

    // Bind the circle radius property to the RadiusWidget radius property
    circle.bindTo('radius', this);

    // Add the sizer marker
    //check=true //document.getElementById("showgrip").checked;
    if (check || true)
    {
        this.addSizer_(self);       
    }
    
}


RadiusWidget.prototype = new google.maps.MVCObject();

RadiusWidget.prototype.distance_changed = function() {
    this.set('radius', this.get('distance') * 1000);
		Marker.mapRadiusMarker.radius = this.get('distance');
		Marker.saveMarkerRadius()
		// console.log(Marker.mapRadiusMarker.radius);
		//var test = this.bbox_(this.get('distance'),Marker.mapRadiusMarker.center);
};


RadiusWidget.prototype.addSizer_ = function(self) {
    var sizer = new google.maps.Marker({
        draggable: true,
        title: 'Drag me!',
        icon: new google.maps.MarkerImage('images/resize.png'),
				id:2
    });

    sizer.bindTo('map', this);
    sizer.bindTo('position', this, 'sizer_position');

    var me = this;
    google.maps.event.addListener(sizer, 'drag', function() {
      // Set the circle distance (radius)
      me.setDistance();
     // console.log(me);
    });
  	self.markersArray.push(sizer);
	
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
};

 
RadiusWidget.prototype.distanceBetweenPoints_ = function(p1, p2) {
    if (!p1 || !p2) {
      return 0;
    }

		
    var R = 6371; // Radius of the Earth in km
    var dLat = (p2.lat() - p1.lat()) * Math.PI / 180;
//		console.log(dLat);
    var dLon = (p2.lng() - p1.lng()) * Math.PI / 180;
//		console.log(dLon);
    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(p1.lat() * Math.PI / 180) * Math.cos(p2.lat() * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c;
//console.log("distanceBetweenPoints_ " + d);
    return d;
   
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