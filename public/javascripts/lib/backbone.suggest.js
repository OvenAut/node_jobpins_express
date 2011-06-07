/**
	+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    Backbone Model Suggest                                               ++++
	+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
**/

  window.Suggest = Backbone.Model.extend({
	
	toggle: function() {
		//console.log("trigger");
		//console.log(this);
		this.set({selected: !this.get("selected")});

	},
	clearModel: function() {
		//console.log(this);
		this.clear({silent:true});
		this.view.remove();
		this.set();
		console.log("clear");
	}
	
	
});

/**
	+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    Backbone Collection Suggest                                          ++++
	+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
**/


window.SuggestList = Backbone.Collection.extend({
	
	model: Suggest,
	//selected
	// selected: function() {
	// 	return this.filter(function(suggest) {
	// 	  return suggest.get('selected');	
	// 	})
	// },
	
	selectfirst: function() {
		console.log("select first");
		//var data = 
		this.first().toggle();
	  //console.log(data);
	  // data.toggle();
	},
	unselect: function() {
		this.each(function(data) {
			//console.log(data);
			if (data.get('selected')) data.toggle();
		});
	},
	selectDown: function() {
		log(this);
		var selectedId = this.getSelected().id;
		selectedId++;
		this.selectWitheId(selectedId);		
	},
	selectUp: function() {
		console.log(this.getSelected());
		var selectedId = this.getSelected().id;
		selectedId--;
		this.selectWitheId(selectedId);
	},
	getSelected: function() {
	return this.detect(function(data) {
			return data.get('selected');
		});
	},
	selectWitheId: function(id) {
		//console.log(id);
		if (id < 0 || id >= this.models.length) return
		this.unselect();
		//console.log(this.get({id:id}));
		this.get({id:id}).toggle();
	},
	clear: function() {
		
		this.refresh([]);
		log(this);
		//_.each(this, function() {
		//	this.clear
		//console.log("clearing");
		//});
		//SuggestView.remove();
	},
	
	// all: function() {
	// 	return this.filter(function(data) {
	// 		return data.get('selected');
	// 	});
		//return this.all();
	//},
});

window.Suggests = new SuggestList;

/**	
+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
	Backbone View SuggestView
+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
**/

window.SuggestView = Backbone.View.extend({

	tagName: "li",

	template: _.template($('#suggest-template').html()),

	events: {
		"click div.suggest-content"     : "selectThis",
		// "dblclick div.search-content" : "edit",
		// "click span.search-destroy" : "clear",
		//"keydown inpute#new-search": "updateOnEnter"

		// "keypress .search-input"    : "updateOnEnter"
	},

	initialize: function() {
		_.bindAll(this, 'render');
		this.model.bind('change', this.update);
    //this.model.bind('refresh', this.remove);
    //this.model.bind('add', this.update);
    //log(this);
		this.model.view = this;
	},
	selectThis: function() {
		Suggests.unselect();
		console.log("selectThis");
		this.model.toggle();
	},
	
	update: function() {
		this.get("selected")?$(this.view.el).addClass("selected"):$(this.view.el).removeClass("selected");
		//console.log(this);
		console.log("update");
	},

	remove: function() {
		$(this.el).remove();
		//console.log(this.el);
		console.log("removed");
	},

	render: function() {
		$(this.el).html(this.template());
//		console.log(this.data);
		this.setContent();
		return this;
	},

	setContent: function() {
		//console.log(this);
		var content = this.model.get('name');
		//console.log(content);
		this.$('.suggest-content').text(content);
		//this.input = this.$('.search-input');
		//this.input.bind('blur', this.close);
		//this.input.val(content);
	},

	// updateOnEnter: function(e) {
	// 	console.log("update KEY");
	// 	if (e.keyCode == 40) this.down();
	// 	// http://www.mediaevent.de/javascript/Extras-Javascript-Keycodes.html
	// 	switch (e.keyCode) {
	// 	  case 40:
	// 	    this.down() 
	// 		  breake;
	// 		case 38:
	// 		  this.up()
	// 		  breake;
	//   }
	// },
	


});




