/**
	+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    Backbone Model Suggest                                               ++++
	+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
**/

  window.Suggest = Backbone.Model.extend({
	
	toggle: function() {
		//console.log("trigger");
		//console.log(this);
		this.set({selected: !this.get("selected")});

	},
	clearModel: function() {
		//console.log(this);
		this.clear({silent:true});
		this.view.remove();
		this.set();
		console.log("clear");
	}
	
	
});



/**
	+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    Backbone Collection Suggest                                          ++++
	+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
**/


window.SuggestCollection = Backbone.Collection.extend({
	
	model: Suggest,
	//selected
	// selected: function() {
	// 	return this.filter(function(suggest) {
	// 	  return suggest.get('selected');	
	// 	})
	// },
	
	clear: function() {
		
		this.refresh();
		console.log("clear 48")
		//_.each(this, function() {
		//	this.clear
		//console.log("clearing");
		//});
		//SuggestView.remove();
	},
	selectDown: function() {
		//console.log(this);
		var selectedId = this.getSelected().id;
		//console.log(selectedId);
		selectedId++;
		this.selectWitheId(selectedId);		
	},
	selectUp: function() {
		//console.log(this.getSelected());
		var selectedId = this.getSelected().id;
		selectedId--;
		this.selectWitheId(selectedId);
	},
	getSelected: function() {
	return this.detect(function(data) {
			//console.log(data);
			return data.get('selected');
		});
	},
	
	selectfirst: function() {
		console.log("select first");
		console.log(this.first());
		this.first().toggle();
	  //console.log(data);
	  // data.toggle();
	},
	
	
	
	
	
	
	unselect: function() {
		this.each(function(data) {
			//console.log(data);
			if (data.get('selected')) data.toggle();
		});
	},
	selectWitheId: function(id) {
		//console.log(id);
		if (id < 0 || id >= this.models.length) return
		this.unselect();
		//console.log(this.get({id:id}));
		this.get({id:id}).toggle();
	},
	suggestAttributes: function(name,id) {
		//console.log(data[i]);
		i=id;
		return { id: i,name: name,selected:false,visible:false};
	},
	newSuggestList: function(data) {
		//console.dir(data);
		var i = 0;
		
		for (name in data) {
			this.add(this.suggestAttributes(name,i++));
		};

			
			//this.add(this.suggestAttributes(row))
		
	},
	
	// <-- app.enterVal
	getval: function(val) {
		//Make a virtual group from val
		var rep = new RegExp("\\.*\\**\\+*\\?*");
		val =  val.replace(rep,"");
		//var rep = new RegExp("[u]+",i);
		//val =  val.replace(rep,"[u|üÜ]");
		// var rep = new RegExp("[a]+",i);
		// val =  val.replace(rep,"[a|äÄ]");
		// var rep = new RegExp("[o]+",i);
		// val =  val.replace(rep,"[o|öÖ]");
		val = this.replaceExp(val);		
		//console.log(val);
		if (val == "") return;
		var re = new RegExp("(^" + val + ".*)" ,"i");
		//console.log(re);
		var data = SuggestList.filter(function(model) {
			return model.get('name').match(re) && !model.get('inuse');
		});
		
		//window.SuggestSelected = new SuggestSelectedList(data);
		//console.dir(SuggestSelected);
		
		
		this.refresh(data);
		console.log(Suggests);
		
		this.selectfirst();
		//console.dir(this);
		
	},
	
	
	// <-- this.getval
	replaceExp: function(val) {
		var whatRep = {u:"[u|üÜ]",a:"[a|äÄ]",o:"[o|öÖ]"};
	  for (rep in whatRep) {
			var repExp = new RegExp("("+rep+")","gi");
			val = val.replace(repExp,whatRep[rep]);
		}
		return val
	},
	
	// for (i in  data) {
	// 	//datain.push(this.suggestAttributes(data,i));
	// 	// data present ?
	// 	//console.log(i);
	// 	if (this.searchesFindValue(i)) continue;
	// 	//console.log(this.searchesFindValue(data[i].key));
	// 	//if (Searches.get({content:data[i].key})) continue; 
	// 	Suggests.add(this.suggestAttributes(data,j++,i));
	// 	//if (j==5) break;
	// 	//console.log(Searches.get({content:data[i].key}));
	// };
	
	// all: function() {
	// 	return this.filter(function(data) {
	// 		return data.get('selected');
	// 	});
		//return this.all();
	//},
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
		"click div.suggest-content"     : "selectThis",
		// "dblclick div.search-content" : "edit",
		// "click span.search-destroy" : "clear",
		//"keydown inpute#new-search": "updateOnEnter"

		// "keypress .search-input"    : "updateOnEnter"
	},

	initialize: function() {
		_.bindAll(this, 'render');
		this.model.bind('change', this.update);
    //this.model.bind('all', this.removeSuggest);
    //this.model.bind('add', this.update);
    //log(this);
		this.model.view = this;
	},
	
	removeSuggest: function() {
		this.$('#suggest-list').empty();
		console.log("removeSuggest 209");
	},
	
	selectThis: function() {
		Suggests.unselect();
		console.log("selectThis");
		this.model.toggle();
	},
	
	update: function() {
		this.get("selected")?$(this.view.el).addClass("selected"):$(this.view.el).removeClass("selected");
		//console.log(this);
		console.log("update");
	},

	remove: function() {
		$(this.el).remove();
		//console.log(this.el);
		console.log("removed");
	},

	render: function() {
		$(this.el).html(this.template());
//		console.log(this.data);
		this.setContent();
		return this;
	},

	lastSuggest: function() {
		//console.log(this);
		//console.log($("#suggest-list").children().length);
		// console.log(this.model.get('id'));
		// console.log(Suggests.last().get('id'));
		return this.model.get('id') == Suggests.last().get('id');
		
	},
	firstSuggest: function() {
		console.log(Suggests);
	 return this.model.get('id') == Suggests.models[0].get('id');
	},
	
	
	setContent: function() {
		
		//console.log(moreSuggest);
		
		var childrens = $("#suggest-list").children().length;
		var content = this.model.get('name');
		var nodeIndex = (Suggests.indexOf(this.model));
		//this.line = 
		this.$('.suggest-content').text(content);
		if (childrens >= 4 && nodeIndex < Suggests.length) this.$('.gui').addClass("down");
		if (childrens == 0 && nodeIndex > 0) this.$('.gui').addClass("up");
		var list = 		this.$('.suggest-content');
		//console.log(list);
		this.model.get("selected")?list.addClass("selected"):list.removeClass("selected");
		console.log(this.model.get("selected"));
		
		//.suggest-content
		//this.input = this.$('.search-input');
		//this.input.bind('blur', this.close);
		//this.input.val(content);
	},

	// updateOnEnter: function(e) {
	// 	console.log("update KEY");
	// 	if (e.keyCode == 40) this.down();
	// 	// http://www.mediaevent.de/javascript/Extras-Javascript-Keycodes.html
	// 	switch (e.keyCode) {
	// 	  case 40:
	// 	    this.down() 
	// 		  breake;
	// 		case 38:
	// 		  this.up()
	// 		  breake;
	//   }
	// },
	


});




