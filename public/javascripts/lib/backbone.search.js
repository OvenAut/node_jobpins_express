/**
	+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
  	Backbone Model Search
	+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
**/
	window.Search = Backbone.Model.extend({

		EMPTY: "empty todo...",
		initialize: function() {
			if (!this.get("content")) {
				this.set({"content": this.EMPTY});
			}
		},
		

		toggle: function(silent) {
			this.save({docActiv: !this.get("docActiv")},silent);
		},
		

		clear: function() {
			this.destroy();
			this.view.remove();
		},
		pageNummber: function(page) {
			var pages = _.keys(this.attributes.couchids);
			pages.sort();
			return _.indexOf(pages,page);
		},
	});




	
/**
	+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    Backbone Collection SearchList
	+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
**/
	
	window.SearchList = Backbone.Collection.extend({

		model:Search,
		
		localStorage: new Store("search"),
		
		getId: function(content) {
			var model = this.detect(function (data) {
				return data.get("content") == content;
			})
			if (typeof model != "undefined")
			return model.id;
		},
		
		nextOrder: function() {
		  if (!this.length) return 1;
		  return this.last().get('order') + 1;
		},

		searchInactiv: function() {
			detected = this.detect(function(data) {
				return data.get("docActiv")==true;
			});
			if (detected) detected.toggle();
		},
		
		isActiv: function(id) {
			detected = this.detect(function(data) {
				return data.get("docActiv")==true;
			});
			if (detected) detected.toggle();
			this.get(id).toggle();
		},
		selectNext: function() {
			
			var lastSearch = _.last(Searches.models);
			var content = "",root;
			if (lastSearch) {
				content = lastSearch.attributes.content;
			  } else {
				content = "";
				root = true;
			}
			this.changeUrl(content,root);
		  
		},
		changeUrl: function(content,root) {
			//console.log(content +" content root " + root);
			var url = encodeURIComponent(content);
			//console.log(url);
			var href="";
			root?href="/#":href = "/#!/categories/" + url + "/0";
			window.location.href = href;
			//Searches.isActiv(data.searchData.id);
			
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
			"click span.search-destroy" : "clear",
		},
		
		initialize: function() {
			_.bindAll(this, 'render');
			this.model.bind('change', this.render);
			//this.model.bind('change:docAcitv', this.renderActiv);
			this.model.view = this;
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
		
		clear: function() {
			SuggestList.get(this.model.attributes.listId).toggle();
			this.model.clear();
			Searches.selectNext();
		}		
	});


