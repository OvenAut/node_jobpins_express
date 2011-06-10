/**
	+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    Backbone Collection SuggestSelected                                  ++++
	+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
**/


window.SuggestListCollection = Backbone.Collection.extend({
	//model: Suggest,

	Attributes: function(name,id) {
		//console.log(data[i]);
		i=id;
		return { 
			id: i,
			name: name,
			selected:false,
			visible:true,
			inuse:false
		};
	},
	newList: function(data) {
		//console.dir(data);
		var i = 0;
		for (name in data) {
			this.add(this.Attributes(name,i++));
		};
	$('#new-search')[0].placeholder = "What you search for?";

	},
		
});


window.SuggestList = new SuggestListCollection;