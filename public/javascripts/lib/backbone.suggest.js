/**
	+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    Backbone Model Suggest                                               ++++
	+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
**/

  window.Suggest = Backbone.Model.extend({
	
	toggle: function(silent) {
		//console.log("trigger");
		//console.log(this);
		this.set({selected: !this.get("selected")},silent);
    //return this;
	},
	hidde: function(silent) {
		//console.log("trigger");
		//console.log(this);
		this.set({visible: !this.get("visible")},silent);
    //return this;
	},
	
	clearModel: function() {
		console.log(this);
		this.clear({silent:true});
		//this.view.remove();
		this.set({},{silent:true});
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
		
		//console.log("clear 48")
		this.refresh({},{silent:true});
		this.each(function(model) {	
			//console.log(this);
		   model.clear();
		//console.log("clearing");
		});
    this.remove(this.first(),{silent:true});
		//this.remove({});
		
		//SuggestView.remove();
		console.log("clear Suggests.length = " + Suggests.length);
		
	},
	// selectDown: function() {
	// 	//console.log(this);
	// 	console.log("selectDown");
	// 	var selected = this.getSelected();
	// 	var selectedId = selected.id;
	// 	var selectedName = selected.attributes.name;
	// 	console.log(selected);
	// 	selectedId++;
	// 	this.selectWitheId(selectedId,selectedName);		
	// },
	// selectUp: function() {
	// 	console.log("selectUp");
	// 	//console.log(this.getSelected());
	// 	var selectedId = this.getSelected().id;
	// 	selectedId--;
	// 	this.selectWitheId(selectedId);
	// },
	selectUpDown: function(dirplus) {
		//console.log(this);
		//console.log("selectUpDown");
		var selectedSug = this.getSelected();
		//console.log(selectedSug);
		var selectedId = selectedSug.id;
		var modelMax = this.models.length;
		modelMax = modelMax -1;
		var nextId = selectedId;
		dirplus?nextId++:nextId--;
		
		//console.log (selectedId + " " + modelMax);		
		if (nextId < 0 || nextId >= (this.models.length)) return
				
		var selectedName = selectedSug.attributes.name;
		//console.log(selected);

		//console.log($("#suggest-list").children().last().text().trim());
		//console.log(name);
		if ($("#suggest-list").children().last().text().trim() === selectedName  && dirplus) {
		  this.hiddeLast(true);
	  } else if ($("#suggest-list").children().first().text().trim() === selectedName  && !dirplus) {
		  this.unhiddeLast(true);

		}
  		this.selectWitheId(selectedSug,nextId);		
	  
	},	
	
	getSelected: function() {
	return this.detect(function(data) {
			//console.log(data);
			return data.get('selected');
		});
	},
		
	unselect: function() {
		this.each(function(data) {
			//console.log(data);
			if (data.get('selected')) data.toggle({silent:true});
		});
	},
	selectWitheId: function(current,nextid) {
		//console.log(id);
		current.toggle({silent:true});
		this.get({id:nextid}).toggle();
		//console.log(this);
		
	},
	
	hiddeLast: function(silent) {
		console.log("next");
		//console.log(this);
		var hiddeId = Suggests.detect(function(data) {
			return data.get('visible');
		});
		//console.log(hiddeId);
		//console.log(this.get({id:hiddeId.id}));
		
		this.get({id:hiddeId.id}).hidde({silent:silent});
		//this.get({id:nextid}).toggle();
		//this.selectWitheId(current,nextid);
	},
	unhiddeLast: function(silent) {
		console.log("next");
		//console.log(this);
		var hiddeIdar = Suggests.select(function(data) {
			return !data.get('visible');
		});
		var hiddeId = _.last(hiddeIdar);
		//console.log(hiddeId);
		//console.log(this.get({id:hiddeId.id}));
		// console.log(hiddeId.id);
		// console.log(nextid);
		// console.log(current);
		
		this.get({id:hiddeId.id}).hidde({silent:silent});
		//this.get({id:nextid}).toggle();
		//this.selectWitheId(current,nextid);
	},
	
	// suggestAttributesW: function(name,id,listid) {
	// 	console.log(listid);
	// 	i=id;
	// 	return { 
	// 		id: i,
	// 		name: name,
	// 		selected:false,
	// 		visible:false,
	// 		listId:listod,
	// 		};
	// },
	// newSuggestList: function(data) {
	// 	//console.dir(data);
	// 	var i = 0;
	// 	
	// 	for (name in data) {
	// 		this.add(this.suggestAttributes(name,i++,data.id));
	// 	};

			
			//this.add(this.suggestAttributes(row))
		
	//},
	
	// <-- app.enterVal
	getval: function(val) {
		//Make a virtual group from val
		if (Suggests.length>0) {
			this.clear();
			this.refresh({},{silent:true});
		};
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
		//console.log(data);
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
		
		//console.log(dataSet);
		
		this.refresh(dataSet);
		
		
		//console.log(Suggests.length);
		
		//if (Suggests.length >= 1) this.selectfirst();
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
		"click div.suggest-content"    : "selectThis",
		"click span.gui.up"           : "clickUp",
		"click span.gui.down"         : "clickDown",
		// "dblclick div.search-content" : "edit",
		// "click span.search-destroy" : "clear",
		//"keydown inpute#new-search": "updateOnEnter"

		// "keypress .search-input"    : "updateOnEnter"
	},

	initialize: function() {
		_.bindAll(this, 'render');
		//this.model.bind('add', this.update);
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
	clickUp: function() {
		console.log("clickUp");
		Suggests.unhiddeLast(false);
	},
	clickDown: function() {
		console.log("clickDown");
		Suggests.hiddeLast(false);
	},
	
	// update: function() {
	// 	this.get("selected")?$(this.view.el).addClass("selected"):$(this.view.el).removeClass("selected");
	// 	//console.log(this);
	// 	console.log("update");
	// },

	remove: function() {
		$(this.el).remove();
		//console.log(this.el);
		console.log("removed");
	},

	render: function() {
		console.log("render");
		var childrens = $("#suggest-list").children().length;
		var nodeIndex = (Suggests.indexOf(this.model));
		// console.log(childrens);
		// console.log(nodeIndex+1);
		// console.log(Suggests.length);
		var text = this.model.get('name')
		if (text.length > 24) {
			//var text = data.content.replace(/.{21}(.*)/,"...");
			text = text.slice(0,22);
		  text = text + "...";
		}
		
		$(this.el).html(this.template({
			up: childrens == 0 && nodeIndex > 0,
			down: childrens >= 4 && nodeIndex+1 < Suggests.length,
			selected: this.model.get("selected"),
			content: content = text,
		}));
//		console.log(this.data);
		//this.setContent();
		return this;
	},

	// lastSuggest: function() {
	// 	//console.log(this);
	// 	//console.log($("#suggest-list").children().length);
	// 	// console.log(this.model.get('id'));
	// 	// console.log(Suggests.last().get('id'));
	// 	return this.model.get('id') == Suggests.last().get('id');
	// 	
	// },
	// firstSuggest: function() {
	// 	console.log(Suggests);
	//  return this.model.get('id') == Suggests.models[0].get('id');
	// },
	
	
	setContent: function() {
		
		console.log("render Suggest");
		
		var childrens = $("#suggest-list").children().length;
		var content = this.model.get('name');
		var nodeIndex = (Suggests.indexOf(this.model));
		//this.line = 
		//this.$('.suggest-content').text(content);
		//if (childrens >= 4 && nodeIndex < Suggests.length) this.$('.gui').addClass("down");
		//if (childrens == 0 && nodeIndex > 0) this.$('.gui').addClass("up");
		var list = 		this.$('.suggest-content');
		//console.log(list);
		//this.model.get("selected")?list.addClass("selected"):list.removeClass("selected");
		//console.log(this.model.get("selected"));
		
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




