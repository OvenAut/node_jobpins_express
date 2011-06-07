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
		//statsTemplate: _.template($('#stats-template').html()),
		//suggestTemplate: _.template($('#suggest-template').html()),
		
		//Delegated events for creating new items, and clearing completed ones.
		events: {
			"keypress #new-search": "createOnEnter",
			"keyup #new-search":  "checkSuggest", // "showTooltip",
			"dblclick div.suggest-content": "createOnEnter",
			//"click .search-clear a": "clearCompleted"
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
			//this.render();
		},

		// Re-rendering the App just means refreshing 
		// the statistics -- the rest of the app doesn't change.
		render: function() {
			//var done = Searches.done().length;
			// this.$('#search-stats').html(this.statsTemplate({
			// 	total:      Searches.length,
			// 	done:       Searches.active().length,
			// 	remaining:  Searches.deactive().length
			// }));
			console.log("render");
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
		searchesFindValue: function(value) {
			return _.detect(Searches.models, function(data) {
				//console.log(data.get("content")==value);
				if ((data.get("content")) == value) {
					return true;
					} 
			});
		},
		
		//Generate the attributes for a new Todo item.
		newAttributes: function() {
			var data = Suggests.getSelected();
			return {
				content: data.attributes.name,
				order:   Searches.nextOrder(),
				done:    false,
				couchids : data.attributes.couchids
			};
		},
		
		//If you hit return in the main input field, 
		//create new Todo model, persisting it to localStorage.
		createOnEnter: function(e) {
			if ((e.keyCode != 13 && e.type != "dblclick") || !this.suggestPresent()) return;
			
			Searches.create(this.newAttributes());
			// var self = this;
			// this.clearSuggest(function() {
			// 	self.input.val('');
			// 	self.showTooltip();
			// });
      this.clearSuggestInpute();
			this.input.val('');
			
		},
		
		//Clear all done todo items, destroying their models.
		// clearCompleted: function() {
		// 	_.each(Searches.done(), function(todo) { 
		// 		todo.clear();
		// 		});
		// 	return false;
		// },
		
		
		
		
		selectFirstSuggest: function() {
			Suggests.selectfirst();
			//console.log(Suggests);
			//console.log(_.first(Suggests));
		},
		
		clearSuggest: function(cb) {
			//console.log(Suggests);
			
			// _.each(Suggests.models, function(data) { 
			// 	data.clearModel();
			// 	});
			Suggests.clear();
			this.$('#suggest-list').empty();
			return cb();
		},
		
		
		renderSuggest: function(data) {
			//console.log("renderSuggest");
			//console.log(data);
			var view = new SuggestView({model: data});
			//data[view.model.attributes.id] = view.model.attributes.content;
			this.$("#suggest-list").append(view.render().el) // append -> Insert contentm specified by the parameters, to the end of each elements in the set of matched elements
		},
		
		renderSuggestList: function() {
			Suggests.each(this.renderSuggest);
			//this.selectFirstSuggest();			
			
		},
		
		suggestAttributes: function(data,j,i) {
			//console.log(data[i]);
			return {
				id:          j,
				name:        i,
				couchids:    data[i],
				selected:    false
			};
		},
		suggestPresent: function() {
			if (Suggests.models.length >= 1) return true;
		},
		
		//Show suggest
		showSuggest: function(data) {
			//this.$("#suggest-list").empty();
			if (data.noData) return;
			//log(data);
			console.log(data);
			
			var datain = [];				
			if (this.suggestPresent()) this.clearSuggest(function() {
				
			});
			var j =0;
			//for (var i = j = 0,j<5,i++) {
			for (i in  data) {
				//datain.push(this.suggestAttributes(data,i));
				// data present ?
				console.log(i);
				if (this.searchesFindValue(i)) continue;
				//console.log(this.searchesFindValue(data[i].key));
				//if (Searches.get({content:data[i].key})) continue; 
				Suggests.add(this.suggestAttributes(data,j++,i));
				//if (j==5) break;
				//console.log(Searches.get({content:data[i].key}));
			};
			//console.log(datain);
			//Suggests.refresh(datain);
			this.renderSuggestList();
			if (this.suggestPresent()) {
				this.selectFirstSuggest();
				this.showTooltip("showSuggest");
		  }
			//data.each(this.renderSuggest);
		},
		
		clearSuggestInpute: function() {
			tmpval = "";
		  //this.showSuggest(); //clearing Suggest
		  //Suggests.clear();
			var self = this;
		  this.clearSuggest(function() {
				
				self.showTooltip("clearSuggestInpute");
			});
		  //this.$("#suggest-list").empty();
			
			
			//return;
			nodata = false;
			
		},
		
		
		checkSuggest: function(e) {
			if (e.keyCode == 40 && Suggests.models.length > 1) {
				//console.log("down");
				Suggests.selectDown();
				return;
			} else if (e.keyCode == 38 && Suggests.models.length >1) {
				//console.log("up");
				Suggests.selectUp();
				return;
			} else if (e.keyCode < 48 && e.keyCode != 8 || e.keyCode > 90 ) {
				return;
			};
			
			
			//console.log(e.keyCode);
			var val = this.input.val();
			if ((val.length < tmpval.length || !nodata) && (val !== tmpval) || val == "") {
				//console.log(tmpval.length+ " tmpval");
			  //console.log("nodata " + (nodata?"true":"false"));
				if (val == "" || val == this.input.attr('plaaceholder')) {
					
					this.clearSuggestInpute();
				} else {
					tmpval = val;
					socket.socketSend(val,'suggest');
				}			
		  };
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
		showTooltip: function(text) {
			var tooltip = this.$(".ui-tooltip-bottom");
			//var val = this.input.val();
			tooltip.fadeOut();
		  if (!this.suggestPresent()) return;
			//if (this.suggestPresent()) console.log("this.suggestPresent");
		  //console.log(Suggests.models.length);
			if (this.tooltipTimeout) clearTimeout(this.tooltipTimeout);
			var show = function() { 
				tooltip.show().fadeIn().text(text);
			};
			this.tooltipTimeout = _.delay(show, 1000);
		}
	});
