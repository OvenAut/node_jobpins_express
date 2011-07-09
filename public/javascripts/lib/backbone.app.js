/**
	+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
  	Backbone View AppView
	+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
**/
window.AppView = Backbone.View.extend({
	el: $("#searchapp"),

	events: {
		"keypress #new-search": "createOnEnter",
		"keyup #new-search":  "enterVal",
		"click .suggest-content.selected": "createOnEnter",
		"dblclick ul.suggest-list": "createOnEnter",
		"click input#new-search": "deletePlaceholder",
		"blur inpute#new-search": "insertPlaceholder",
	},
	
	initialize: function() {
		
		_.bindAll(this, 'addOne', 'addAll', 'renderSuggestList','enterVal','addRadMarker','insertPlaceholder');
		
		this.input = this.$("#new-search");
		
		Searches.bind('add',     this.addOne);
		Searches.bind('reset', this.addAll);
		Suggests.bind('reset', this.renderSuggestList);
		Suggests.bind('change', this.renderSuggestList);
		Marker.bind('reset', this.addRadMarker);
		Marker.bind('add', this.addRadMarker);
		this.input.bind('blur', this.insertPlaceholder);
		Marker.fetch();
		Searches.fetch();
		this.insertPlaceholder();
		
	  
	},

	addOne: function(search) {

		if (SuggestList.length>0) {
			SuggestList.get(search.attributes.listId).toggle();
		}
		var view = new SearchView({model: search});
		this.$("#search-list").append(view.render().el)
	},

	addAll: function() {
		Searches.each(this.addOne);
		Marker.renderAllMarkers();
	},
	
	enterVal: function(e) {
		if (SuggestList.length <= 0) {
			this.input.val("");
			this.input.blur();
			return;
		  }
		if (e.keyCode == 40 && Suggests.models.length > 1) {
			Suggests.selectUpDown(true);
			return;
		} else if (e.keyCode == 38 && Suggests.models.length >1) {
			Suggests.selectUpDown(false);
			return;
		} else if (e.keyCode < 48 && e.keyCode != 8 || e.keyCode > 90 ) {
		};
		if (e.keyCode == 37 || e.keyCode == 39) {
			return
		};
		if (Suggests.length >0)Suggests.clear();
		var val = this.input.val();
			if (val == "" || val == this.input.attr('plaaceholder')) {
				this.$('#suggest-list').empty();
			} else {
				tmpval = val;
				Suggests.getval(val);					
			}			
	},

	renderSuggest: function(data) {
		if (this.$("#suggest-list").children().length > 4 || !data.get('visible')) return;
		var view = new SuggestView({model: data});
		this.$("#suggest-list").append(view.render().el)
	},
	
	renderSuggestList: function() {
		this.$('#suggest-list').empty();
		Suggests.each(this.renderSuggest);	
	},
	deletePlaceholder: function() {
	//	console.log("deletePlaceholder");
//
		if (this.input.val() === this.input.attr('placeholder')) {
			this.input.val("");
			this.input.removeClass("placeholder");
		}
	},
	insertPlaceholder: function() {
	//	console.log("insertPlaceholder");
		//var input = this.$('#input#new-serach');
		if (this.input.val() == "") {
			this.input.addClass("placeholder");
			this.input.val(this.input.attr('placeholder'));
		}
	},
	
	
	searchesFindValue: function(value) {
		return _.detect(Searches.models, function(data) {
			if ((data.get("content")) == value) {
				return true;
				} 
		});
	},
	
	newAttributes: function() {
		var data = Suggests.getSelected();
		return {
			content: data.attributes.name,
			order:   Searches.nextOrder(),
			couchids: {},
			listId: data.attributes.listId,
			color: this.newColor(),
			docActiv:false
		};
	},
	
	createOnEnter: function(e) {
		//console.log(e);
		if ((e.keyCode != 13 && e.type != "click") || !this.suggestPresent()) return;
		var contener = this.newAttributes()
		Searches.create(contener);
		var lastId = Searches.last().id;
		socket.socketSend({key:contener.content, id:lastId},"getSearchData");
     this.clearSuggestInpute();
		this.input.val('');
		this.input.blur();
	},
	
	newColor: function() {
		function color() {
			return Math.round((Math.random() * 15)).toString(16);
		}
		return "#" + color() + color() + color() 
	},
	
	selectFirstSuggest: function() {
		SuggestSelected.selectfirst();
	},
	
	clearSuggest: function(cb) {
		Suggests.clear();
		this.$('#suggest-list').empty();
		return cb();
	},
	
	suggestPresent: function() {
		if (Suggests.models.length >= 1) return true;
	},
		
	clearSuggestInpute: function() {
		tmpval = "";
		var self = this;
	  this.clearSuggest(function() {
			
			self.showTooltip("clearSuggestInpute");
		});
		nodata = false;
	},
	
	showTooltip: function(text) {
		var tooltip = this.$(".ui-tooltip-bottom");
		tooltip.fadeOut();
	  if (!this.suggestPresent()) return;
		if (this.tooltipTimeout) clearTimeout(this.tooltipTimeout);
		var show = function() { 
			tooltip.show().fadeIn().text(text);
		};
		this.tooltipTimeout = _.delay(show, 1000);
	},
	
	addRadMarker: function(marker) {
		
		if (typeof Marker.first() == 'undefined') return;
		//console.log("addRadMarker");
		var view = new RadMarker({model:Marker.first()});
		this.$("#marker-list").append(view.render().el)
		
	},
	
	
	
});
