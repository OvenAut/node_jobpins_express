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
		_.bindAll(this,'changeCursorMode','renderAllMarkers','addNewMarkers','removeNonExistentMarkers');
	  this.bind("add",this.addNew);
	  //Searches.bind('change:couchids',this.addNewMarkers);
	  //Searches.bind('remove',this.addNewMarkers);
	  this.bind('remove',this.removeRadMarkers);
	  //this.bind('remove',this.removeMapListerner);
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
	markersArray: [],
	
	removeRadMarkers: function() {
		this.radiusMode.status = true;
		this.changeCursorMode();
		this.removeRadiusMarker();
	},
	
	addNewMarkers: function(Sid,couchData) {
		//console.log("addNewMarkers");
		//console.log(this);
		var self = this;
		var data = Searches.get(Sid).attributes;
		//var jobs = couchData;
		var dataKeys = _.keys(couchData);
		//var sGroup = Sid;
		dataKeys.sort();
		var categories = encodeURIComponent(data.content);
		//var color = data.color;
		for (id in couchData) {
			//console.log(id);
			var index = _.indexOf(dataKeys,id,true);
			//self.addMarker(jobs[id].lat,jobs[id].lng,color,jobs[id],index,categories,id,sGroup);
			var marker = new MarkerWidget(couchData[id].lat,couchData[id].lng,data.color,couchData[id],categories,index,id,Sid,self.map,self)
		  
			//var marker = new MarkerWidget(lat,lng,color,model,counter,categories,id,sGroup,this.map,this)
		  
		};				
		
	},
  // removeMarks: function(model) {
  //  		console.log(model.id);
  // 		this.removeNonExistentMarkers(model.id);
  // },

	changeCursorMode: function(event) {
		var html;
		this.radiusMode.status = !this.radiusMode.status;
		!this.radiusMode.status?html = this.radiusMode.deac.html:html = this.radiusMode.ac.html;
		$('.circleMap').html(html);
		//this.radiusMode.status = !this.radiusMode.status;
		this.radiusMode.status?this.addMapListener(this):this.removeMapListerner(this);
		
	},
	
		
	renderAllMarkers: function() {
		//console.log("renderAllMarkers");
		
		var self = this;
		Searches.each(function(data) {
		  var jobs = data.attributes.couchids;
		  var dataKeys = _.keys(jobs);
			var sGroup = data.attributes.id;
		  dataKeys.sort();
			var categories = encodeURIComponent(data.attributes.content);
			var color = data.attributes.color;
			for (id in jobs) {
			  var index = _.indexOf(dataKeys,id,true);
			  // self.addMarker(jobs[id].lat,jobs[id].lng,color,jobs[id],categories,index,id,index,sGroup);
			var marker = new MarkerWidget(jobs[id].lat,jobs[id].lng,color,jobs[id],categories,index,id,sGroup,self.map,self)
			};				
	  });
		
    if (!!Marker.models.length) {
			self.renderRadMarker();
			self.hideRadMarker();
		}	
		
	},
	
	
	
	
	renderRadMarker: function() {
		var marker = Marker.first().attributes;
		var location = new google.maps.LatLng(marker.center.lat, marker.center.lng);
		//if (typeof check != 'boolean') check = false;
		var distanceWidget = new DistanceWidget(this.map,location,marker.radius,this);		
	},
	
	renderMarkers: function() {
		//console.log("renderMarkers");
		var self = this;
		Searches.each(function(data) {
				var jobs = data.attributes.couchids;
				var dataKeys = _.keys(jobs);
				var sGroup = data.attributes.id;
				dataKeys.sort();
					var categories = encodeURIComponent(data.attributes.content);
				var color = data.attributes.color;
				for (id in jobs) {
					//console.log(id);
					//var index = _.indexOf(dataKeys,id,true);
					self.addMarker(jobs[id].lat,jobs[id].lng,color,jobs[id],categories,id,sGroup);
					
					//var marker = new MarkerWidget(lat,lng,color,model,counter,categories,id,sGroup,this.map,this)
				  
				};				
		});		
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
	
	addMapListener: function(self) {
		
		if (!!!Marker.models.length) {
		  self.map["draggableCursor"] ='crosshair';			
		  this.mapEvent = this.googleMaps.event.addListener(self.map, 'click', function(event) {
			  if (!!Marker.models.length) return
				  var check = true;
				  var distanceWidget = new DistanceWidget(self.map,event.latLng,5,self,check);
		  });
		} else {
		  //this.addMarkers(true)
		this.showOverlays(self);
		}

	},
	
	removeMapListerner: function(self) {
		this.hideRadMarker();
	  //this.addMarkers(false);
	  delete self.map.draggableCursor;
				
		if (this.mapEvent.hasOwnProperty('prop')) {
			this.googleMaps.event.removeListener(this.mapEvent);
		};
		
	},
	
	saveMarkerRadius: function() {

		var radMarker = this.mapRadiusMarker;
		radMarker.bbox = this.getBboxMarkerRadius(radMarker.radius,radMarker.center);
		if (Marker.models.length > 0) {
			var last = Marker.last();
			last.set(radMarker,{silent:true});
			last.save({silent:true});
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
  showOverlays:function(self) {
	  if (this.markersArray) {
	    for (i in this.markersArray) {
	      this.markersArray[i].setMap(self.map);
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
	
	// deletAllMarkers: function(cb) {
	// 	console.log("deletAllMarkers");
	// 	//console.log(this);
	//   if (this.markersArray && !!this.markersArray.length) {
	// 		var self = this;
	// 		var radMarkerIds = [1,2,3];
	// 		var newMarkersArray = [];
	// 	  self.markersArray.forEach(function(marker) {
	// 			if (!!!radMarkerIds.length) return
	// 			//self.getRadMarkerIds(radMarkerIds,newMarkersArray)
	// 			for(var i = 0 ; i<radMarkerIds.length;i++) {
	// 				if (marker.id == radMarkerIds[i]) {
	// 						newMarkersArray.push(marker);
	// 						radMarkerIds.splice(i,1);
	// 						continue;
	// 						};
	// 			};
	// 		});
	// 	  self.markersArray = newMarkersArray;
	// 				
	// 	  }
	// 	cb();
		
	//},
	
	// getRadMarkerIds: function(radMarkerIds,newMarkersArray)
	// for(var i = 0 ; i<radMarkerIds.length;i++) {
	// 	if (marker.id == radMarkerIds[i]) {
	// 			newMarkersArray.push(marker);
	// 			radMarkerIds.splice(i,1);
	// 			continue;
	// 			};
	// ),
	
	hideRadMarker: function() {
    if (this.markersArray) {
		var radMarkerIds = [1,2];
		this.markersArray.forEach(function (marker) {
			//var radMarkerIds = [1,2]
			if (!!!radMarkerIds.length) return

			for(var i = 0 ; i<radMarkerIds.length;i++) {
				if (marker.id == radMarkerIds[i]) {
					// console.log("fundId");
					// console.log(marker);
						marker.setMap(null);
						radMarkerIds.splice(i,1);
						continue;
						}
					
					//console.log(radMarkerIds.length);
					//console.log(marker.id);
				//this.markersArray[i].setMap(null);
		    
				}
			});
		};
	},
	removeRadiusMarker: function() {
		//console.log("removeRadiusMarker");
		var self = this;
		var radMarkerIds = [1,2,3];
		var newMarkerArray = [];
		//var dummy = this.markersArray;
		for (var i = 0;i<self.markersArray.length;i++) { 
		// //this.markersArray.forEach(function (marker) {
		// 	//var radMarkerIds = [1,2]
		// 	//if (!!!radMarkerIds.length) return
		// 	console.log(dummy.length);
		// 	console.log("loop");
			for(var j = 0 ; j<radMarkerIds.length;j++) {
				if (self.markersArray[i].id == radMarkerIds[j]) {
					   // console.log("fundId");
					// console.log(marker);
						self.markersArray[i].setMap(null);
						break;
						//self.newMarkerArray.splice(i,1);
						//radMarkerIds.splice(i,1);
						//continue;
						};
				if (radMarkerIds.length-1==j)
					newMarkerArray.push(self.markersArray[i]);
					// console.log(radMarkerIds.length);
					// console.log(j);
					// 	
					// console.log(dummy[i].id + " dummy.id");
					// console.log(radMarkerIds[j] + " radMarkerID");
					//console.log(radMarkerIds.length);
					//console.log(marker.id);
				//this.markersArray[i].setMap(null);
		    };
			//});
			};
			// console.log(newMarkerArray.length);
			self.markersArray = newMarkerArray;
	},
	
	removeNonExistentMarkers: function(id) {
		this.id = id;
		var self = this;
		//var radMarkerIds = [1,2,3];
		var newMarkersArray = [];
		//var markersSid = [];
		//var counter = 0;
		//console.log(self.markersArray.length);
		for (var i=0;i<self.markersArray.length;i++) {
			if(self.markersArray[i].id == self.id) {
				//console.log("setVisible");
				//console.log(self.markersArray[i]);
				
				self.markersArray[i].setMap(null);
				//self.markersArray[i].setVisible(false);
				//self.markersArray.splice(i,1);
				//counter++;
			} else {
				newMarkersArray.push(self.markersArray[i]);
			}
			
		};
		self.markersArray = newMarkersArray;		
		//var mapMarker = self.map.Ma.pa;
		
		//console.log(self.markersArray.length);

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



function MarkerWidget(lat,lng,color,model,categories,counter,id,sGroup,map,self) {
	var location = new google.maps.LatLng(lat, lng);
  color = color.replace('#','');
  var image = 'http://dev.oszko.net/images/' + color + 'marker.png';

 		//console.log("MarkereWidget");
	    this.set('map', map);
	var marker = new google.maps.Marker({
   position: location,
   map: map,
   icon: image,
   title:model.company || "",
   Sid:id,
   shadow:self.shadow,
   id:sGroup
 });
 	google.maps.event.addListener(marker, 'click', function() {

	    window.location.href = "/#!/categories/" + categories +"/" +counter;
			
	  });


		    marker.bindTo('map', this);

			 self.markersArray.push(marker);




	}


MarkerWidget.prototype = new google.maps.MVCObject();
