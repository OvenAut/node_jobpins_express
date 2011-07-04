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
		_.bindAll(this,'changeCursorMode');
	  this.bind("add",this.addNew);
	  Searches.bind('change:couchids',this.addMarkersChange);
	  Searches.bind('remove',this.addMarkers);
	  this.bind('remove',this.addMarkers);
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
		center:{},
		bbox:""
	},
	
	
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
			var location = new google.maps.LatLng(marker.center.lat, marker.center.lng);
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
			if (!!Marker.models.length) return
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
		//console.log("save")
		// console.log(self)
		// console.log(Marker.mapRadiusMarker);
		var radMarker = this.mapRadiusMarker;
		//console.log(this.mapRadiusMarker);
		radMarker.bbox = this.getBboxMarkerRadius(radMarker.radius,radMarker.center)
		if (Marker.models.length > 0) {
			var last = Marker.last();
			//console.log(radMarker)
				//last.attributes.center = radMarker.center;
				//last.attributes.radius = radMarker.radius;
				//last.attributes.bbox = radMarker.bbox;
				last.set(radMarker,{silent:true});
			last.save({silent:true});

		} else {
	  Marker.create(radMarker);
		}
		
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

		//console.log(out);
		return out;
		function grad2rad(grad) {
			return grad * Math.PI / 180
		}
		function rad2Grad(rad) {
			return rad * 180/ Math.PI
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

window.RadMarker = Backbone.View.extend({
		
		tagName: "li",
		
		template: _.template($('#radmarkerItem-template').html()),
		
		events: {
			"click span.radmarker-destroy" : "clear",
			"keypress .radmarker-input" : "updateOnEnter",
			"dblclick div.radmarker-email" : "edit"
		},
		
		initialize: function() {
			_.bindAll(this, 'render','close');
			this.model.bind('change', this.render);
			//this.model.bind('change:docAcitv', this.renderActiv);

			this.model.view = this;
			// this.input = this.$('.radmarker-input')
		},		
		
		render: function() {
			
			//console.log("render Searches " + this.model.id);
			$(this.el).html(this.template(this.renderAttributes(this.model.attributes)));
			this.setContent();
			
			return this;
		},
		
		setContent: function() {
			var content = this.model.get('email');
			this.$('.radmarker-email').text(content);
			this.input = this.$('.radmarker-input');
			this.input.bind('blur',this.close);
			this.input.val(content);
			if (!!content) $('.radmarker-input').hide();
		},
		
		renderAttributes: function(data) {
			//console.log(data);
			var altText = "";
			var text = altText = data.email || "";
			if (text.length > 23) {
				//var text = data.content.replace(/.{21}(.*)/,"...");
				text = text.slice(0,20);
			  text = text + "...";
			}
			return {
				email:text,
				// color:data.color,
				// counter:_.size(data.couchids),
				// altText:altText,
				// activ:data.docActiv,
				// id:data.id,
				// urlname:encodeURIComponent(data.content),
				// page:this.model.pageNummber(data.docOpen),
			}
		},
		close: function() {
			if (!validateEmail(this.input.val())) return;
			//console.log(this.model);
			Marker.mapRadiusMarker.email = this.input.val();
      this.model.save({email: this.input.val()});
     // $(this.el).addClass('close');
			$('.radmarker-email').show();
			$('.radmarker-input').hide();
			function validateEmail(elementValue) {
				var emailPlattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
				return emailPlattern.test(elementValue);
			}

    },

    // If you hit `enter`, we're through editing the item.
    updateOnEnter: function(e) {
      if (e.keyCode == 13) this.close();
    },
    
		edit: function() {
      //$(this.el).removeClass("close");
			$('.radmarker-email').hide();
			$('.radmarker-input').show();

      this.input.focus();
    },
    
		clear: function() {
			//SuggestList.get(this.model.attributes.listId).toggle();
			this.model.clear();
			//Searches.selectNext();
		}
})
