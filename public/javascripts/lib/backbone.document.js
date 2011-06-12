/**
	+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    Backbone Document Model                                               ++++
	+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
**/

  window.Document = Backbone.Model.extend({
	
	toggle: function() {
		//console.log("trigger");
		//console.log(this);
		this.set({selected: !this.get("selected")});

	},
	
	// get Collection -> delet Model ->save back
	clearModel: function() {
		//console.log(this);
		this.clear({silent:true});
		this.view.remove();
		console.log("clear");
	}
	
	
});

/**
	+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    Backbone Document Collection
	+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
**/
	
	window.DocumentList = Backbone.Collection.extend({
		/*
		query = {}
		deactiv
		color
		order
		*/
		model:Document,
		
		localStorage: new Store("search"),
		
		active: function() {
			return this.filter(function(searchparam) {  //filter => array.filter(callback) 
				return searchparam.get('active');
			});
		},
		deactive: function() {
			return this.without.apply(this, this.active());
		},
		
		nextOrder: function() {
		  if (!this.length) return 1;
		  return this.last().get('order') + 1;
		},
		
	});
	
	
	
	
	window.Documents = new DocumentList;




	
/**
	+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++	
	  Backbone Document View
  +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
**/

	window.DocumentView = Backbone.View.extend({
		
		tagName: "li",
		
		template: _.template($('#searchItem-template').html()),
		
		events: {
			"click .check"     : "toggleDone",
			"dblclick div.search-content" : "edit",
			"click span.search-destroy" : "clear",
			"keypress .search-input"    : "updateOnEnter"
		},
		
		initialize: function() {
			_.bindAll(this, 'render', 'close');
			this.model.bind('change', this.render);
			this.model.view = this;
		},
		
		render: function() {
			$(this.el).html(this.template(this.model.toJSON()));
			this.setContent();
			
			return this;
		},
		
		setContent: function() {
			// console.log("model");
			// console.log(this);
			var content = this.model.get('content');
			this.$('.search-content').text(content);
			this.input = this.$('.search-input');
			this.input.bind('blur', this.close);
			this.input.val(content);
		},
		
		toggleDone: function() {
			this.model.toggle();
		},
		
		edit: function() {
			$(this.el).addClass('editing');
			this.input.focus();
		},
		
		close: function() {
			this.model.save({content: this.input.val()});
			$(this.el).removeClass('editing');
		},
		
		updateOnEnter: function(e) {
			if (e.keyCode == 13) this.close();
		},
		
		clear: function() {
			this.model.clear();
		}
		
		
	});


