/**
	+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
  	Backbone Model Search
	+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
**/
	window.Search = Backbone.Model.extend({

		// If you don't provide a todo, one will be provided for you.		
		EMPTY: "empty todo...",
		// http://paulirish.com/2009/memorable-hex-colors/
		//colors: {'#bada55':true,"#accede":true,"affec7":true,"baff1e":true},
		// Ensure that each todo created has content.
		initialize: function() {
			if (!this.get("content")) {
				this.set({"content": this.EMPTY});
			}
		},
		
		// Toggle the done state of this todo
		toggle: function(silent) {
			this.save({docActiv: !this.get("docActiv")},silent);
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
		
		// active: function() {
		// 	return this.filter(function(searchparam) {  //filter => array.filter(callback) 
		// 		return searchparam.get('active');
		// 	});
		// },
		// deactive: function() {
		// 	return this.without.apply(this, this.active());
		// },
		getId: function(content) {
			var model = this.detect(function (data) {
				return data.get("content") == content;
			})
			return model.id;
		},
		
		nextOrder: function() {
		  if (!this.length) return 1;
		  return this.last().get('order') + 1;
		},
		// getNameX: function(name) {
		// 		var getName = Searches.detect(function(data) {
		// 			return (data.get("content") == name);
		// 		});
		// 	if (getName) return true;
		// 	return false;
		// },
		//getNameCached: this.getName.cached(),
		//getName: SearchList.getName.cachedTrac(),
		isActiv: function(id) {
			detected = this.detect(function(data) {
				return data.get("docActiv")==true;
			});
			if (detected) detected.toggle();
			this.get(id).toggle();
		},
		
	});
	
	window.Searches = new SearchList;
	//Searches.getName = Searches.getName.cachedTrac();



	
/**
	+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++	
	  Backbone View SearchView
  +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
**/

	window.SearchView = Backbone.View.extend({
		
		tagName: "li",
		
		template: _.template($('#searchItem-template').html()),
		
		events: {
			//"dblclick div.search-content" : "edit",
			"click span.search-destroy" : "clear",
			//"keypress .search-input"    : "updateOnEnter"
			//	"click div.search-content"     : "activateDocument",
		},
		
		initialize: function() {
			_.bindAll(this, 'render');
			this.model.bind('change', this.render);
			//this.model.bind('add', this.listupdate);
			this.model.view = this;
		},
		
		render: function() {
			console.log("render Searches " + this.model.id);
			$(this.el).html(this.template(this.renderAttributes(this.model.attributes)));
			//this.setContent();
			
			return this;
		},
		renderAttributes: function(data) {
			//console.log(data);
			var altText = "";
			var text = data.content;
			if (text.length > 24) {
				altText = text;
				//var text = data.content.replace(/.{21}(.*)/,"...");
				text = text.slice(0,22);
			  text = text + "...";
			}
			return {
				content:text,
				color:data.color,
				counter:_.size(data.couchids),
				altText:altText,
				activ:data.docActiv,
				id:data.id,
			}
		},
		// activateDocument: function() {
		// 	//console.log(this);
		// 	DocumentList.prepare(this.model.id);
		// 	//window.location.href = "#"+this.model.id;
		// 	//this.model
		// },
		
		
		// setContent: function() {
		// 	// console.log("model");
		// 	// console.log(this);
		// 	var content = this.model.get('content');
		// 	//Searches.getName(content);
		// 	this.$('.search-content').text(content);
		// 	//this.input = this.$('.search-input');
		// 	//this.input.bind('blur', this.close);
		// 	//this.input.val(content);
		// },
		
		
		// toggleDone: function() {
		// 	this.model.toggle();
		// },
		// 
		// edit: function() {
		// 	$(this.el).addClass('editing');
		// 	this.input.focus();
		// },
		// 
		// close: function() {
		// 	this.model.save({content: this.input.val()});
		// 	$(this.el).removeClass('editing');
		// },
		// 
		// updateOnEnter: function(e) {
		// 	if (e.keyCode == 13) this.close();
		// },
		
		clear: function() {
			// if (SuggestList.length>0) {
			SuggestList.get(this.model.attributes.listId).toggle();
			// 	console.log(search.attributes.listId);
			// }
			//console.log(this.model.attributes.listId);
			this.model.clear();
		}
		
		
	});


