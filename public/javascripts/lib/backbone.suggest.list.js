/**
	+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    Backbone Model Suggest                                               ++++
	+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
**/

  window.SuggestModel = Backbone.Model.extend({
	
	toggle: function(silent) {
		//console.log("trigger");
		//console.log(this);
		this.set({inuse: !this.get("inuse")},silent);
    //return this;
	},
	
	
});





/**
	+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    Backbone Collection SuggestSelected                                  ++++
	+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
**/


window.SuggestListCollection = Backbone.Collection.extend({
	
	model: SuggestModel,
	
	Attributes: function(name,id,listid) {
		//console.log(listid);
		//console.log(Searches.getName(name));
		i=id;
		return { 
			id: i,
			name: name,
			selected:false,
			visible:true,
			inuse:Searches.getName(name), //Searches.getName(name)?true:false,
		};
	},
	
	newList: function(data) {
		//console.dir(data);
		
		var i = 0,j;
		for (name in data) {
			this.add(this.Attributes(name,i++,data));
		};
	var guiText = "Jobpins have " + i +" categories for you. Lastupdate(couchDB): " + j;	
	$('#new-search')[0].placeholder = "What you search for?";
  $('div#slogen').animate({opacity:0.2},2000,function() {
			$('#slogen').text(guiText).animate({opacity:1},2000);
		});
	},
		
});


window.SuggestList = new SuggestListCollection;