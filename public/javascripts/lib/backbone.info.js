window.InfoCollection = Backbone.Collection.extend({
	
  initialize: function() {
	_.bindAll(this,"newAttributes");
  },

  newData: function(data) {
		//console.log(data);
		//console.log("newData");
		data.data.forEach(this.newAttributes)
		//Info.addAll();
  },

  newAttributes: function(element,index,array) {
		this.add({
			id:element.id,
			name:element.key,
			date:element.value.las,
			activ:element.value.ac || false
		});
		//console.log(element);
		//console.log(index);
		//console.log(array);
  },
  
	updateData: function(data) {
		//console.log("updateData");
		this.clear(function() {
		  socket.socketSend({},"getServerInfo");			
		});

		//this.newData(data);
	},
	

  clear: function(cb) {
		this.reset({},{silent:true});
		this.each(function(model) {	
		   model.clear();
		});
    this.remove(this.first(),{silent:true});
		cb()
	},
	
});

window.InfoData = new InfoCollection;

window.InfoView = Backbone.View.extend({
	el: $("#header"),
	events: {	
				//"click #slogen": "showInfo",
				"mouseenter #slogen": "showInfo",
				"mouseleave #slogen": "hiddeInfo"
	 },
	initialize: function() {
		//Marker.start();
		//console.log("initialize InfoView")
		socket.socketSend({},"getServerInfo");
	  
	 },
	
	showInfo: function() {
		//console.log("showInfo");
	  //socket.socketSend({},"getServerInfo");
	  this.addAll();
	},
	hiddeInfo: function() {
		this.$("#info-list").empty();
	},
	
	
	addOne: function(data) {
		var view = new InfoDataView({model: data});
		this.$("#info-list").append(view.render().el)
	},
	
	addAll: function() {
		InfoData.each(this.addOne);
	},
	
	
});

window.InfoDataView = Backbone.View.extend({
	tagName: "li",
	
	template: _.template($('#info-template').html()),
	
	//el: $("#infoel"),

	initialize: function() {
		//Marker.start();
		//console.log("initialize InfoView")
	 },
	
	render: function() {
		
		//console.log("render Searches " + this.model.id);
		$(this.el).html(this.template(this.renderAttributes(this.model.attributes)));
		//this.setContent();
		
		return this;
	},
	
	renderAttributes: function(data) {
		var date = Date.now() - data.date;
		var difdate = new Date(date);
		
		function addZero (inDate) {
			if (inDate < 10)
			return inDate = "0" + inDate;
			return inDate;
		}
		var outData = addZero(difdate.getUTCHours()) + ":" + addZero(difdate.getUTCMinutes()) + ":" + addZero(difdate.getUTCSeconds());
		
		
		return {
			content:data.name,
			date:outData,
			activ:data.activ
		}
	},
	
});