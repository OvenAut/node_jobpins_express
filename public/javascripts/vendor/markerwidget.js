function MarkerWidget(lat,lng,color,model,id,sGroup,self) {

	this.categories = self.categories;
	this.counterIndex = self.counterIndex;
	var location = new google.maps.LatLng(lat, lng);
  color = color.replace('#','');
  var image = 'http://dev.oszko.net/images/' + color + 'marker.png';
  //this.set('map', map);
	var marker = new google.maps.Marker({
    position: location,
    map: self.map,
    icon: image,
    title:model.company || "",
    Sid:id,
    shadow:self.shadow,
    id:sGroup
  });
	var me = this;
 	google.maps.event.addListener(marker, 'click', function(Myevent) {
    window.location.href = "/#!/categories/" + me.categories +"/" +me.counterIndex;
	});
  //marker.bindTo('map', this);
  self.markersArray.push(marker);
};

MarkerWidget.prototype = new google.maps.MVCObject();