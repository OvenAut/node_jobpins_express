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

	window.SearchParams = Backbone.Model.extend({

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
		model:SearchParams,
		
		localStoreg: new Store("SearchParams"),
		
		active: function() {
			return this.filter(function(searchparam) {  //filter => array.filter(callback) 
				return searchparam.get('active');
			});
		},
		deactive: function() {
			return this.without.apply(this, this.active());
		},
		
	});
	
	window.Searches = new SearchList;
	
	// window.TodoView = Backbone.View.extend({
	// 	
	// 	tagName: "li",
	// 	
	// 	template: _.template($('#search-template').html()),
	// 	
	// 	event: {
	// 		"click .check"     : "toggleDone",
	// 		"dbclick div.todo-content" : "edit",
	// 		"click span.todo-destroy" : "clear",
	// 		"keypress .todo-input"    : "updateOnEnter"
	// 	},
	// 	
	// 	initialize: function() {
	// 		_.bindAll(this, 'render', 'close');
	// 		this.model.bind('change', this.render);
	// 		this.model.view = this;
	// 	},
	// 	
	// 	
	// });
});