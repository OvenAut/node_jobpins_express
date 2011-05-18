// var query = require('./jquery-1.6.min');
//      undercore = require('./underscore'),
//      BackboneLoad = require('./backbone.min'),
//      BackboneLocalStorageLoad = require('./backbone.localStorage');

//query();

function initializeMap() {
    var latlng = new google.maps.LatLng(48.208174,16.373819);
    var myOptions = {
      zoom: 11,
      center: latlng,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    var map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);
  }


$(document).ready(function() {
	//initializeMap(); //map

  $.getJSON('http://dev.oszko.net/couchdb/test',function(data) {
		var item = [];
		$.each(data, function(key,val) {
			items.push('li id="' + key +'">' + val + '</li>');
		});
		$('#test', {
		    'class': 'my-new-list',
		    html: items.join('')
		  }).appendTo('body');
	});





	window.Search = Backbone.Model.extend({

		// If you don't provide a todo, one will be provided for you.		
		EMPTY: "empty todo...",
		
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
	
  // The Application
	// Our overall AppView is the top-level piece of UI.
	window.AppView = Backbone.View.extend({
		
		//Instead of generating a new element, 
		//bind to the existing skeleton of the App already present in the HTML.
		el: $("#searchapp"),
		
		//Our template for the line of statistics at the bottom of the app.
		statsTemplate: _.template($('#stats-template').html()),
		
		//Delegated events for creating new items, and clearing completed ones.
		events: {
			"keypress #new-search": "createOnEnter",
			"keyup #new-search": "showTooltip",
			"click .search-clear a": "clearCompleted"
		},
		
		//At initialization we bind to the relevant events on the Todos collection, 
		//when items are added or changed. Kick things off by loading any 
		//preexisting todos that might be saved in localStorage.
		// 	});
		// window.blabla = ({
		
		initialize: function() {
			_.bindAll(this, 'addOne', 'addAll', 'render');
			
			this.input = this.$("#new-search");
			
			Searches.bind('add',     this.addOne);
			Searches.bind('refresh', this.addAll);
			Searches.bind('all',     this.render);
			
			Searches.fetch();
		},

		// Re-rendering the App just means refreshing 
		// the statistics -- the rest of the app doesn't change.
		render: function() {
			//var done = Searches.done().length;
			this.$('#search-stats').html(this.statsTemplate({
				total:      Searches.length,
				done:       Searches.active().length,
				remaining:  Searches.deactive().length
			}));
		},
		
		//Add a single todo item to the list by creating a 
		//view for it, and appending its element to the <ul>.
		addOne: function(search) {
			var view = new SearchView({model: search});
			this.$("#search-list").append(view.render().el) // append -> Insert contentm specified by the parameters, to the end of each elements in the set of matched elements
		},
		
		//Add all items in the Todos collection at once.
		addAll: function() {
			Searches.each(this.addOne);
		},
		
		//Generate the attributes for a new Todo item.
		newAttributes: function() {
			return {
				content: this.input.val(),
				order:   Searches.nextOrder(),
				done:    false
			};
		},
		
		//If you hit return in the main input field, 
		//create new Todo model, persisting it to localStorage.
		createOnEnter: function(e) {
			if (e.keyCode != 13) return;
			Searches.create(this.newAttributes());
			this.input.val('');
		},
		
		//Clear all done todo items, destroying their models.
		clearCompleted: function() {
			_.each(Searches.done(), function(todo) { 
				todo.clear();
				});
			return false;
		},
		//Lazily show the tooltip that tells you 
		//to press enter to save a new todo item, after one second.
		showTooltip: function(e) {
			var tooltip = this.$(".ui-tooltip-top");
			var val = this.input.val();
			tooltip.fadeOut();
			if (this.tooltipTimeout) clearTimeout(this.tooltipTimeout);
			if (val == "" || val == this.input.attr('plaaceholder')) return;
			var show = function() { 
				tooltip.show().fadeIn();
			};
			this.tooltipTimeout = _.delay(show, 1000);
		}
	});
	
	window.App = new AppView;
});