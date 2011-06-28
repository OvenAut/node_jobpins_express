window.InfoCollection = Backbone.Collection.extend({
	
  initialize: function() {
	_.bindAll(this,"newAttributes");
  },

  newData: function(data) {
		//console.log(data);
		data.data.forEach(this.newAttributes)
  },

  newAttributes: function(element,index,array) {
		this.add({
			id:element.id,
			name:element.key,
			date:element.value
		});
		//console.log(element);
		//console.log(index);
		//console.log(array);
  },
  

});

window.InfoData = new InfoCollection;

window.InfoView = Backbone.View.extend({
	tagName: "li",
	
	template: _.template($('#info-template').html()),
	
	
  el: $("#header"),

	events: {	
				"click #slogen": "showInfo",
	 },
	initialize: function() {
		//Marker.start();
		//console.log("initialize InfoView")
	 },
	
	showInfo: function() {
		console.log("showInfo");
	  socket.socketSend({},"getServerInfo");
	  
	},
	render: function() {
		
		//console.log("render Searches " + this.model.id);
		$(this.el).html(this.template(this.renderAttributes(this.model.attributes)));
		//this.setContent();
		
		return this;
	},
	renderAttributes: function(data) {
		//console.log(data);
		var altText = "";
		var text = altText = data.content;
		if (text.length > 23) {
			//var text = data.content.replace(/.{21}(.*)/,"...");
			text = text.slice(0,20);
		  text = text + "...";
		}
		return {
			content:text,
			color:data.color,
			counter:_.size(data.couchids),
			altText:altText,
			activ:data.docActiv,
			id:data.id,
			urlname:encodeURIComponent(data.content),
			page:this.model.pageNummber(data.docOpen),
		}
	},
	
			
	
});