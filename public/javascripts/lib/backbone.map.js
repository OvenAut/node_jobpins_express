window.Markmodel = Backbone.Model.extend({

	clear: function() {
		this.destroy();
		this.view.remove();
	},
});

window.MarkerCollection = Backbone.Collection.extend({
	
	localStorage: new Store("marker"),
	
	model:Markmodel,
	
	initialize: function() {
		_.bindAll(this,'changeCursorMode','renderAllMarkers','setMarkerWidget','removeNonExistentMarkers');
	  //this.bind("add",this.addNew);
	  this.bind('remove',this.removeRadMarkers);
	  this.bind('all',this.sendToServer);
	  $('.circleMap').bind('click' ,this.changeCursorMode);
		//$('.infoRad').bind('change',this.liveAction);
		
		
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
		center:{},
		bbox:""
	},
	markersArray: [],
	liveValues: {},
	
	liveAction: function(arg) {
		if (!!arg.position) {
				this.liveValues.lat = (arg.position.lat()*100000 | 0)/100000;
				this.liveValues.lng = (arg.position.lng()*100000 | 0)/100000;
		}
		if (!!arg.distance) 
		this.liveValues.distance = arg.distance | 0;
	
	
	this.renderLatLngInfo()
	
		
	// 	if (!!arg.position) {
	// 	$('.infoLat').html(arg.position.lat());
	// 	$('.infoLng').html(arg.position.lng());
	// } else if (!!arg.distance) {
	// 
	// 	$('.infoRad').html(arg.distance | 0);
	// }
	// $('.infoLat').html(arg.position.lat());
	// $('.infoLng').html(arg.position.lng());
	// $('.infoRad').html(arg.distance | 0);
	
	},
	
	
	sendToServer: function(data) {
		//console.log(data);
		// console.log(this.models[0].attributes);
		var data = this.models[0].attributes;
		if (validateEmail(data.email))
				socket.emit('radMarker',data);
		function validateEmail(elementValue) {
			var emailPlattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
			return emailPlattern.test(elementValue);
		}
		
	},
	
	renderLatLngInfo: function() {
		$('.infoLat').html(this.liveValues.lat+ " lat");
		$('.infoLng').html(this.liveValues.lng+ " lng");
		$('.infoRad').html(this.liveValues.distance + " m");
	},
	
	
	removeRadMarkers: function() {
		this.radiusMode.status = true;
		this.changeCursorMode();
		this.removeRadiusMarker();
	},
	
	changeCursorMode: function(event) {
		var html;
		this.radiusMode.status = !this.radiusMode.status;
		!this.radiusMode.status?html = this.radiusMode.deac.html:html = this.radiusMode.ac.html;
		$('.circleMap').html(html);
		//this.radiusMode.status = !this.radiusMode.status;
		this.radiusMode.status?this.addMapListener():this.removeMapListerner();
		
	},
	
		
	renderAllMarkers: function() {
		var self = this;
		Searches.each(function(data) {
			var couchdbVal = data.attributes;
			self.setMarkerWidget(couchdbVal.id,couchdbVal.couchids);
		});		
    if (!!Marker.models.length) {
			self.renderRadMarker();
			self.hideRadMarker();
		}	
		
	},
	
	setMarkerWidget: function(Sid,couchData) {
		var self = this;
		var data = Searches.get(Sid).attributes;
		var dataKeys = _.keys(couchData);
		dataKeys.sort();
		self.categories = encodeURIComponent(data.content);
		for (id in couchData) {
			self.counterIndex = _.indexOf(dataKeys,id,true);
			var marker = new MarkerWidget(couchData[id].lat,couchData[id].lng,data.color,couchData[id],id,Sid,self)
		};				
	},
	
	
	renderRadMarker: function() {
		var marker = Marker.first().attributes;
		var location = new google.maps.LatLng(marker.center.lat, marker.center.lng);
		//if (typeof check != 'boolean') check = false;
		var distanceWidget = new DistanceWidget(this.map,location,marker.radius,this);		
	},

	googleMaps: google.maps,

	start: function() {
		
		 this.startPosition = new google.maps.LatLng(48.208174,16.373819);
	   var myOptions = {
	     zoom: 11,
	     center: this.startPosition,
	     mapTypeId: google.maps.MapTypeId.ROADMAP,
	   };
	   this.map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);
	   this.shadow = new google.maps.MarkerImage('images/shadow.png',
			 new google.maps.Size(22,12),
			 new google.maps.Point(0,0),
			 new google.maps.Point(2,17)
	   );
	
	},
	
	addMapListener: function() {
		var self = this;
		if (!!!Marker.models.length) {
		  self.map["draggableCursor"] ='crosshair';			
		  self.mapEvent = self.googleMaps.event.addListener(self.map, 'click', function(event) {
			  if (!!Marker.models.length) return
				  var check = true;
				  var distanceWidget = new DistanceWidget(self.map,event.latLng,5,self);
		  });
		} else {
		  //this.addMarkers(true)
		self.showOverlays();
		}

	},
	
	removeMapListerner: function(self) {
		this.hideRadMarker();
	  //this.addMarkers(false);
	  delete this.map.draggableCursor;
				
		if (this.mapEvent.hasOwnProperty('prop')) {
			this.googleMaps.event.removeListener(this.mapEvent);
		};
		
	},
	
	saveMarkerRadius: function() {

		var radMarker = this.mapRadiusMarker;
		radMarker.bbox = this.getBboxMarkerRadius(radMarker.radius,radMarker.center);
		if (Marker.models.length) {
			var last = Marker.last();
			//last.set(radMarker,{silent:true});
			last.save(radMarker);
		} else {
	  Marker.create(radMarker);
		};
		
	},
	
	getBboxMarkerRadius: function(distance,center) {
		
		var lat = center.lat;
		var lon = center.lng;
		var rad = distance;
		var R = 6371;
		var out = [];

		out[2] = lat + rad2Grad(rad/R);
		out[0] = lat - rad2Grad(rad/R);

		out[3] = lon + rad2Grad(rad/R/Math.cos(grad2rad(lat)));
		out[1] = lon - rad2Grad(rad/R/Math.cos(grad2rad(lat)));

		return out;
		function grad2rad(grad) {
			return grad * Math.PI / 180
		}
		function rad2Grad(rad) {
			return rad * 180/ Math.PI
		}
		
	},
	
	


 zoomWien: function() {
 	this.map.setCenter(this.startPosition);
  this.map.setZoom(11);
 },
 
 gotoMarker: function(couchid) {
	selectedMarker = _.detect(this.markersArray,function(marker) {
		return marker.Sid == couchid;
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
	      this.markersArray[i].setMap(this.map);
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
	    return cb(this);
	  }
	cb(this);
	},
	

	
	hideRadMarker: function() {
    if (this.markersArray) {
		  var radMarkerIds = [1,2];
		  this.markersArray.forEach(function (marker) {
			if (!!!radMarkerIds.length) return
        for(var i = 0 ; i<radMarkerIds.length;i++) {
				  if (marker.id == radMarkerIds[i]) {
					  marker.setMap(null);
						radMarkerIds.splice(i,1);
						continue;
				  }
				}
			});
		};
	},
	
	removeRadiusMarker: function() {
		var self = this;
		var radMarkerIds = [1,2,3];
		var newMarkerArray = [];
		for (var i = 0;i<self.markersArray.length;i++) { 
			for(var j = 0 ; j<radMarkerIds.length;j++) {
				if (self.markersArray[i].id == radMarkerIds[j]) {
				  self.markersArray[i].setMap(null);
					break;
					};
				if (radMarkerIds.length-1==j)
					newMarkerArray.push(self.markersArray[i]);
		  };
		};
		self.markersArray = newMarkerArray;
	},
	
	removeNonExistentMarkers: function(id) {
		this.id = id;
		var self = this;
		var newMarkersArray = [];
		for (var i=0;i<self.markersArray.length;i++) {
			if(self.markersArray[i].id == self.id) {
				self.markersArray[i].setMap(null);
			} else {
				newMarkersArray.push(self.markersArray[i]);
			}
		};
		self.markersArray = newMarkersArray;		
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

window.RadMarker = Backbone.View.extend({
		
		tagName: "li",
		openEdit:false,
		template: _.template($('#radmarkerItem-template').html()),
		
		events: {
			"click span.radmarker-destroy" : "clear",
			"keypress .radmarker-input" : "updateOnEnter",
			"dblclick div.radmarker-email" : "edit",
		//	"blur .radmarker-input": "close",
		},
		
		initialize: function() {
			_.bindAll(this, 'render','close');
			//this.model.bind('change', this.render);
			//this.model.bind('change:docAcitv', this.renderActiv);
			this.model.view = this;
			//this.input = this.$('.radmarker-input');
		},		
		
		render: function() {
			$(this.el).html(this.template(this.renderAttributes(this.model.attributes)));
			
			this.setContent();
			Marker.renderLatLngInfo();
			return this;
			
		},		
		
		setContent: function() {
			this.input = this.$('.radmarker-input');
			this.input.bind('blur',this.close);
		},
		
		renderAttributes: function(data) {
			return {
				email:data.email || "",
				openEdit: this.openEdit,
			}
		},
		
		close: function() {

			var text = this.input.val();
			if (!validateEmail(text)) return;
			this.openEdit = false;
      this.model.save({email: text});
			this.render();
			function validateEmail(elementValue) {
				var emailPlattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
				return emailPlattern.test(elementValue);
			}

    },

    updateOnEnter: function(e) {
      if (e.keyCode == 13) this.close();
    },
    
		edit: function() {
			this.openEdit = true;
			this.render();
      this.input.focus();
    },
    
		clear: function() {
			this.model.clear();
		}
});
