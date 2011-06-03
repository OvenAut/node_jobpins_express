// var query = require('./jquery-1.6.min');
//      undercore = require('./underscore'),
//      BackboneLoad = require('./backbone.min'),
//      BackboneLocalStorageLoad = require('./backbone.localStorage');

var socket = new io.Socket(location.hostname),
		data = {},
		hm = false,
		tmpval; 


io.Socket.prototype.socketSend = function(data,name) {
	var sendData = {};
	
	sendData[name] = data;
  var sending = socket.send({
		sid:  connect.sid,
		data: sendData		
		});
//	console.dir(sending);
	//console.log("sending");

}

//query();

function initializeMap() {
    var latlng = new google.maps.LatLng(48.208174,16.373819);
    var myOptions = {
      zoom: 11,
      center: latlng,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    var map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);
  };


// function socketSend(data) {
//   socket.send({
// 		sid:  connect.sid,
// 		data: data		
// 		});	
// }



$(document).ready(function() {

	socket.connect();
  
	socket.on('connect', function(){ 
		//Searches.trigger('socket');
		//window.App.socket
    //Search.trigger('socket');
    //socket.socketSend(data,'connection');
    //data = {};
	}); 
	socket.on('message', function(data){

		if (data.suggest) {
			
			if (_.isEmpty(data.suggest)) console.log("no Suggests");
			window.App.showSuggest(data.suggest);
			//Searches.trigger('showSuggest',data);
			//console.log(data);
		} 

	  //console.log('incomming');		
	
	}); 
	socket.on('disconnect', function(){ 
		console.log('disconnected');
	});




/**
	Google Map
**/	

//  initializeMap(); //map
 



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
	    Backbone Collection Suggest                                          ++++
		+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
	**/

		window.SuggestList = new Backbone.Collection([]);





	
	
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


	/**	
	+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
		Backbone View SuggestView
	+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
	**/

		window.SuggestView = Backbone.View.extend({

			tagName: "li",

			template: _.template($('#suggest-template').html()),

			events: {
				// "click .check"     : "toggleDone",
				// "dblclick div.search-content" : "edit",
				// "click span.search-destroy" : "clear",
				"keypress #new-search": "updateOnEnter"
				
				// "keypress .search-input"    : "updateOnEnter"
			},

			initialize: function() {
				_.bindAll(this, 'render');
				
				//this.model.view = this;
			},

			render: function() {
				$(this.el).html(this.template());
//				console.log(this.data);
				this.setContent();
				return this;
			},

			setContent: function() {
				//console.log(this);
				var content = this.model.get('key');
				//console.log(content);
				this.$('.suggest-content').text(content);
				//this.input = this.$('.search-input');
				//this.input.bind('blur', this.close);
				//this.input.val(content);
			},

			updateOnEnter: function(e) {
				console.log("update");
				if (e.keyCode == 40) this.down();
				// http://www.mediaevent.de/javascript/Extras-Javascript-Keycodes.html
				switch (e.keyCode) {
				  case 40:
				    this.down() 
					  breake;
					case 38:
					  this.up()
					  breake;
			  }
			},
			up: function() {
				console.log('up');
			},
			
			
			down: function() {
				console.log('down');
			}
			

		});

	
/**
	+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
  	Backbone View AppView
	+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
**/


  // The Application
	// Our overall AppView is the top-level piece of UI.
	window.AppView = Backbone.View.extend({
		hm:false,
		//Instead of generating a new element, 
		//bind to the existing skeleton of the App already present in the HTML.
		el: $("#searchapp"),
		
		//Our template for the line of statistics at the bottom of the app.
		statsTemplate: _.template($('#stats-template').html()),
		//suggestTemplate: _.template($('#suggest-template').html()),
		
		//Delegated events for creating new items, and clearing completed ones.
		events: {
			"keypress #new-search": "createOnEnter",
			"keyup #new-search":  "showTooltip", // "showTooltip",
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
			//Searches.bind('all',     this.render);
			//Searches.bind('socket',  this.giveName);
			//Searches.bind('showSuggest', this.showSuggest)
			//SuggestList.bind('add', this.renderSuggestList);
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
		// renderSuggest: function() {
		// 			//var done = Searches.done().length;
		// 			this.$('#suggestColumn').html(this.suggestTemplate({
		// 				
		// 			}));
		//},
		socketSearchData: function(Searchlist) {
			socket.socketSend(Searchlist,'searchlist');
		},
		
		//Add a single todo item to the list by creating a 
		//view for it, and appending its element to the <ul>.
		addOne: function(search) {
			//console.log(bla);
			//console.log("hallo");
			//if (this.hm) console.log("hello");
			var view = new SearchView({model: search});
			data[view.model.attributes.id] = view.model.attributes.content;
			this.$("#search-list").append(view.render().el) // .render().elappend -> Insert contentm specified by the parameters, to the end of each elements in the set of matched elements
			if (!this.hm) this.socketSearchData(data);
		},
		
		//Add all items in the Todos collection at once.
		addAll: function() {
			this.hm = true;
			Searches.each(this.addOne);
			this.hm = false;
			this.socketSearchData(data);
		},
		
		
		//giveName: function() {
			// Searches.each(function(search) {
			// 	var view = new SearchView({model: search});
			// 	//console.log(view.model.attributes.content);
			// 	data[view.model.attributes.id] = view.model.attributes.content;
			// //	data.push()
			// });
		//	console.log("giveName");
		//},
		// addOneRouter: function() {
		// 
		// 	this.addOne;
		// 	this.giveName;
		// },
		
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
		
		
		
		
		
		renderSuggest: function(data) {
			//console.log("renderSuggest");
			//console.log(data);
			var view = new SuggestView({model: data});
			//data[view.model.attributes.id] = view.model.attributes.content;
			this.$("#suggest-list").append(view.render().el) // append -> Insert contentm specified by the parameters, to the end of each elements in the set of matched elements			
		},
		renderSuggestList: function() {
			//console.log("renderSuggestList");
			//console.log(SuggestList);
			
			SuggestList.each(this.renderSuggest);
		},
		
		//Show suggest
		showSuggest: function(data) {
			//console.log("hallo");
			//console.log(data);
			//SuggestList.add(data);
			//this.clearSuggest();
			this.$("#suggest-list").empty();
			
			var j = 1;
			var datain = [];				
			
			for (i in  data) {
				//console.log("lop");
				//console.log(data[i].key);
				datain.push({id:(j++),key:data[i].key,couchid:data[i].value});
			 	//SuggestList.add(datain);
			};
			//console.log(datain);
			SuggestList.refresh(datain);
			this.renderSuggestList();
			//data.each(this.renderSuggest);
		},
		// removeSuggest: function(data) {
		// 	console.log("clear");
		// 	
		// 	data.clear();
		// },
		// 
		// clearSuggest: function() {
		// 	var j =1;
		// 	console.log(SuggestList);
		// 	///SuggestList.each(this.removeSuggest);
		// 	
		// 	// for (var i = 0 ;i<SuggestList.length;i++) {
		// 	// 	console.log("removed id " + j++);
		// 	// 	SuggestList.remove({id:j});
		// 	// }
		// 	console.log("removed");
		// 	console.log(SuggestList);
		// 	this.$("#suggest-list").empty();
		// },
		
		
		//Get Suggest by keyup from Couchdb and show tooltip
		// getSuggest: function(e) {
		// 	this.showTooltip(e);
		// },
				
		//Lazily show the tooltip that tells you 
		//to press enter to save a new todo item, after one second.
		showTooltip: function(e) {
			var tooltip = this.$(".ui-tooltip-top");
			var val = this.input.val();
			tooltip.fadeOut();
			if (this.tooltipTimeout) clearTimeout(this.tooltipTimeout);
			if (val !== tmpval) {
			if (val == "" || val == this.input.attr('plaaceholder')) {
				
			  this.showSuggest();
				return;
			}
			//console.log(val);
			//this.clearSuggest();
			
			socket.socketSend(val,'suggest');
		  };
			tmpval = val;
			var show = function() { 
				tooltip.show().fadeIn();
			};
			this.tooltipTimeout = _.delay(show, 1000);
		}
	});
	
	window.App = new AppView;
			
});