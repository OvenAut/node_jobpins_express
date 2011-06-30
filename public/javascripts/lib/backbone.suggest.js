/**
	+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    Backbone Model Suggest                                               ++++
	+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
**/

  window.Suggest = Backbone.Model.extend({
	
	toggle: function(silent) {
		this.set({selected: !this.get("selected")},silent);
	},
	
	hidde: function(silent) {
		this.set({visible: !this.get("visible")},silent);
	},
	
	// clearModel: function() {
	// 	this.clear({silent:true});
	// 	this.set({},{silent:true});
	// 	//console.log("clear");
	// }
	
	
});



/**
	+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    Backbone Collection Suggest                                          ++++
	+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
**/


window.SuggestCollection = Backbone.Collection.extend({
	
	model: Suggest,
	
	clear: function() {
		this.refresh({},{silent:true});
		this.each(function(model) {	
		   model.clear();
		});
    this.remove(this.first(),{silent:true});
		
	},

	selectUpDown: function(dirplus) {
		var selectedSug = this.getSelected();
		var selectedId = selectedSug.id;
		var modelMax = this.models.length;
		modelMax = modelMax -1;
		var nextId = selectedId;
		dirplus?nextId++:nextId--;
		
		if (nextId < 0 || nextId >= (this.models.length)) return
				
		var selectedName = selectedSug.attributes.name;
		if (selectedName.length > 24) {
			selectedName = selectedName.slice(0,22);
		  selectedName = selectedName + "...";
		}
		if ($("#suggest-list").children().last().text().trim() === selectedName  && dirplus) {
		  this.hiddeLast(true);
	  } else if ($("#suggest-list").children().first().text().trim() === selectedName  && !dirplus) {
		  this.unhiddeLast(true);

		}
  		this.selectWitheId(selectedSug,nextId);		
	  
	},	
	
	getSelected: function() {
	return this.detect(function(data) {
			return data.get('selected');
		});
	},
		
	unselect: function() {
		this.each(function(data) {
			if (data.get('selected')) data.toggle({silent:true});
		});
	},
	selectWitheId: function(current,nextid) {
		current.toggle({silent:true});
		this.get({id:nextid}).toggle();		
	},
	
	hiddeLast: function(silent) {
		var hiddeId = Suggests.detect(function(data) {
			return data.get('visible');
		});
		
		this.get({id:hiddeId.id}).hidde({silent:silent});
	},
	unhiddeLast: function(silent) {
		var hiddeIdar = Suggests.select(function(data) {
			return !data.get('visible');
		});
		var hiddeId = _.last(hiddeIdar);
		
		this.get({id:hiddeId.id}).hidde({silent:silent});
	},

	getval: function(val) {
		if (Suggests.length>=0) {
			this.clear();
			this.refresh({},{silent:true});
		};
		var rep = new RegExp("\\.*\\**\\+*\\?*");
		val =  val.replace(rep,"");
		val = this.replaceExp(val);		
		if (val == "") return;
		var re = new RegExp("(^" + val + ".*)" ,"i");
		var data = SuggestList.filter(function(model) {
			return model.get('name').match(re) && !model.get('inuse');
		});
		var dataSet = [];
		for (i in data) {
			dataSet.push({
				id:i,
				inuse:data[i].attributes.inuse,
				name:data[i].attributes.name,
				selected:i==0?true:data[i].attributes.selected,
				visible:data[i].attributes.visible,
				listId:data[i].attributes.id,
				});
		};
		this.refresh(dataSet);		
	},
	
	replaceExp: function(val) {
		var whatRep = {u:"[u|üÜ]",a:"[a|äÄ]",o:"[o|öÖ]"};
	  for (rep in whatRep) {
			var repExp = new RegExp("("+rep+")","gi");
			val = val.replace(repExp,whatRep[rep]);
		}
		return val
	},
});

window.Suggests = new SuggestCollection;

/**	
+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
	Backbone View SuggestView
+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
**/

window.SuggestView = Backbone.View.extend({

	tagName: "li",

	template: _.template($('#suggest-template').html()),

	events: {
		"click div.suggest-content"    : "selectThis",
		"click span.gui.up"           : "clickUp",
		"click span.gui.down"         : "clickDown",
	},

	initialize: function() {
		_.bindAll(this, 'render');
		this.model.view = this;
	},
	
	removeSuggest: function() {
		this.$('#suggest-list').empty();
		//console.log("removeSuggest 209");
	},
	
	selectThis: function() {
		Suggests.unselect();
		this.model.toggle();
	},
	clickUp: function() {
		Suggests.unhiddeLast(false);
	},
	clickDown: function() {
		Suggests.hiddeLast(false);
	},

	remove: function() {
		$(this.el).remove();
	},

	render: function() {
		var childrens = $("#suggest-list").children().length;
		var nodeIndex = (Suggests.indexOf(this.model));
		var text = this.model.get('name')
		if (text.length > 24) {
			text = text.slice(0,22);
		  text = text + "...";
		}
		
		$(this.el).html(this.template({
			up: childrens == 0 && nodeIndex > 0,
			down: childrens >= 4 && nodeIndex+1 < Suggests.length,
			selected: this.model.get("selected"),
			content: content = text,
		}));
		return this;
	},
	
	setContent: function() {
		var childrens = $("#suggest-list").children().length;
		var content = this.model.get('name');
		var nodeIndex = (Suggests.indexOf(this.model));
		var list = 		this.$('.suggest-content');
	},

});




