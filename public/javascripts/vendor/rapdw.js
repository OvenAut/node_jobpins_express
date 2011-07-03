
function DistanceWidget(map,center, radius, liColor, liWidth, liOpa, fillColor, fillOpa) {
    this.set('map', map);
    this.set('position',center);
      
    var image = new google.maps.MarkerImage('images/markers/freemaptools.png',
    // This marker is 20 pixels wide by 32 pixels tall.
    new google.maps.Size(20, 34),
    // The origin for this image is 0,0.
    new google.maps.Point(0,0),
    // The anchor for this image is the base of the flagpole at 0,32.
    new google.maps.Point(10, 33));
    var shadow = new google.maps.MarkerImage('images/gmmarkersv3/shadow.png',
    // The shadow image is larger in the horizontal dimension
    // while the position and offset are the same as for the main image.
    new google.maps.Size(28, 22),
    new google.maps.Point(0,0),
    new google.maps.Point(1, 22));
    
    check=document.getElementById("show").checked;
    if (check)
    {
        var marker = new google.maps.Marker({
          draggable: true,
          title: 'Drag me!',shadow:shadow,icon:image
        });
        routeMarkers.push(marker);
        
        // Bind the marker map property to the DistanceWidget map property
        marker.bindTo('map', this);

        // Bind the marker position property to the DistanceWidget position
        // property
        marker.bindTo('position', this);
    }



    // Create a new radius widget
    
    var radiusWidget;
    
    //if the opacity is clear "#0" then use zero
    if (fillColor=="#0")
    {
        radiusWidget= new RadiusWidget(center, radius, liColor, liWidth, liOpa, fillColor, 0);
    }
    else
    {
        radiusWidget= new RadiusWidget(center, radius, liColor, liWidth, liOpa, fillColor, fillOpa);
    }

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

function RadiusWidget(center, radius, liColor, liWidth, liOpa, fillColor, fillOpa) {
            
    var circle = new google.maps.Circle({
          center: center,
          map: map,
          radius: radius*1000,
          strokeColor: liColor,
          strokeWeight: liWidth,
          strokeOpacity: liOpa,
          fillColor: fillColor,
          clickable: false,
          fillOpacity: fillOpa
    });
    
    routeCircles.push(circle);
     
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
    showgrip=document.getElementById("showgrip").checked;
    if (showgrip)
    {
        this.addSizer_();       
    }
    getoutputdata(center,radius);
    
    findpolyenc(dataforstaticmap);
    dataforstaticmap="";
    pathcount=+1;
    
    var qs;
    qs="?clat="+center.lat()+"&clng="+center.lng()+"&r="+radius+"&lc="+liColor+"&lw="+liWidth+"&fc="+fillColor;
    qs=qs.replace(/#/g, "");
    document.getElementById("tb_url").value="http://www.freemaptools.com/radius-around-point.htm" + qs;
    
}


RadiusWidget.prototype = new google.maps.MVCObject();

RadiusWidget.prototype.distance_changed = function() {
    this.set('radius', this.get('distance') * 1000);
};


RadiusWidget.prototype.addSizer_ = function() {
    var sizer = new google.maps.Marker({
        draggable: true,
        title: 'Drag me!',
        icon: new google.maps.MarkerImage('images/markers/resize.png')
    });

    sizer.bindTo('map', this);
    sizer.bindTo('position', this, 'sizer_position');

    var me = this;
    google.maps.event.addListener(sizer, 'drag', function() {
      // Set the circle distance (radius)
      me.setDistance();
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
    if (map.markers)
    {
        map.clearMarkers();
    }

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