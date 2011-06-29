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
		"dblclick div.suggest-content": "createOnEnter",
	},
	
	initialize: function() {
		
		_.bindAll(this, 'addOne', 'addAll', 'renderSuggestList','enterVal');
		
		this.input = this.$("#new-search");
		
		Searches.bind('add',     this.addOne);
		Searches.bind('refresh', this.addAll);
		Suggests.bind('refresh', this.renderSuggestList);
		Suggests.bind('change', this.renderSuggestList);
		Searches.fetch();	  
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
		Marker.addMarkers();
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
		if ((e.keyCode != 13 && e.type != "dblclick") || !this.suggestPresent()) return;
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
	
	// showSuggest: function(data) {
	// 	if (data.noData) return;
	// 	//var datain = [];				
	// 	if (this.suggestPresent()) this.clearSuggest(function());
	// 	//var j =0;
	// 	// if (this.suggestPresent()) {
	// 	// 	this.showTooltip("showSuggest");
	// 	// 	  }
	// },
	
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
		
});
