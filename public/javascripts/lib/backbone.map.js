window.MapView = Backbone.View.extend({
  el: $("#map_canvas"),
	events: {
		// "keypress #new-search": "createOnEnter",
		// "keyup #new-search":  "enterVal", // "showTooltip",
		// "dblclick div.suggest-content": "createOnEnter",
		//
		//"click .search-clear a": "clearCompleted"
	},
	
	//At initialization we bind to the relevant events on the Todos collection, 
	//when items are added or changed. Kick things off by loading any 
	//preexisting todos that might be saved in localStorage.
	// 	});
	// window.blabla = ({
	
	initialize: function() {
		
		// _.bindAll(this, 'addOne', 'addAll', 'renderSuggestList','enterVal');
		// 
		// this.input = this.$("#new-search");
		// 
		// Searches.bind('add',     this.addOne);
		// Searches.bind('refresh', this.addAll);
		// Suggests.bind('refresh', this.renderSuggestList);
		// Suggests.bind('change', this.renderSuggestList);
		// 
		// //SuggestSelected.bind('all',this.clearSuggest)
		// //Searches.bind('all',     this.render);
		// //Searches.bind('socket',  this.giveName);
		// //Searches.bind('showSuggest', this.showSuggest)
		// //SuggestList.bind('add', this.renderSuggestList);
		// Searches.fetch();
		// window.DocumentList = new DocumentListCollection;
		// this.showDoc();
		// //this.render();

	   var latlng = new google.maps.LatLng(48.208174,16.373819);
	   var myOptions = {
	     zoom: 11,
	     center: latlng,
	     mapTypeId: google.maps.MapTypeId.ROADMAP
	   };
	   var map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);

		
	},
			
});