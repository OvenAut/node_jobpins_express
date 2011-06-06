/**
	+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
  	Backbone Model Search
	+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
**/
	window.Search = Backbone.Model.extend({

		// If you don't provide a todo, one will be provided for you.		
		EMPTY: "empty todo...",
		// http://paulirish.com/2009/memorable-hex-colors/
		colors: {'#bada55':true,"#accede":true,"affec7":true,"baff1e":true},
		// Ensure that each todo created has content.
		initialize: function() {
			if (!this.get("content")) {
				this.set({"content": this.EMPTY});
			}
		},
		
		// Toggle the done state of this todo
		toggle: function() {
			this.save({done: !this.get("done")});
		},
		
		//Remove this Todo from localStorage and delete its view.
		clear: function() {
			this.destroy();
			this.view.remove();
		}
		
	});




	
/**
	+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    Backbone Collection SearchList
	+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
**/
	
	window.SearchList = Backbone.Collection.extend({
		/*
		query = {}
		deactiv
		color
		order
		*/
		model:Search,
		
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
	
	window.Searches = new SearchList;




	
/**
	+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++	
	  Backbone View SearchView
  +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
**/

	window.SearchView = Backbone.View.extend({
		
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


