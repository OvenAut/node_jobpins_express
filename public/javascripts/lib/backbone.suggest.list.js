/**
	+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    Backbone Model Suggest                                               ++++
	+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
**/

  window.SuggestModel = Backbone.Model.extend({
	
	toggle: function(silent) {
		this.set({inuse: !this.get("inuse")},silent);
	},
	
	
});





/**
	+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    Backbone Collection SuggestSelected                                  ++++
	+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
**/


window.SuggestListCollection = Backbone.Collection.extend({
	
	model: SuggestModel,
	
	Attributes: function(name,id,listid,InuseNameList) {
		i=id;
		return { 
			id: i,
			name: name,
			selected:false,
			visible:true,
			inuse:InuseNameList[name]?true:false,
		};
	},
	
	newList: function(data,cb) {
		var InuseNameList = {};
		Searches.each(function (search) {
				InuseNameList[search.attributes.content] = true;
		});

		var i = 0;
		for (name in data) {
			this.add(this.Attributes(name,i++,data,InuseNameList));
		};
	  this.guiNotice();
		cb(i)
	},
	
	
	guiNotice: function() {
		$('#new-search')[0].placeholder = "What you search for?";
	},
		
});


window.SuggestList = new SuggestListCollection;