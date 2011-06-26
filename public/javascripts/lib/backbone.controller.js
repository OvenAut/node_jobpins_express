var restfulApp = Backbone.Controller.extend({

	routes: {
			"!/categories/:content/:index":          "documentIndexAction",  //This matches app/animals/* and assigns * to a variable called "animal"
			//"/categories/:content":          "documentAction",  //This matches app/animals/* and assigns * to a variable called "animal"
			"!/zoomwien":     "mapZoomWien",
			"*page":                 	"defaultAction", //This simply matches any urls that weren't caught above and assigns it to "page"
			},

  documentIndexAction: function(content,index) {
	  if (index == "undefined") index = 0;
	  content = decodeURIComponent(content);	

		var id = Searches.getId(content);
		if (typeof id=="undefined" || _.size(Searches.get(id).attributes.couchids) < index)  {
			window.location.href = "/#";
		  return;
		}
		var Document = {};
		Document.attributes = Searches.get(id).attributes;
		Document.keys = _.keys(Document.attributes.couchids);

		Document.keys.sort();
		Document.nextDoc = 		Document.keys[index];
		Document.attributes.docOpen = Document.nextDoc;
		Searches.get(id).attributes.docOpen = Document.nextDoc;
		
		Marker.gotoMarker(Document.nextDoc);
	  $("#column1box").fadeOut('slow');
    Documents.render(id);// body...
    document.title="Jobpins" + " " + content + " " +  Document.attributes.couchids[Document.nextDoc].company;
  },
  mapZoomWien: function() {
  	Marker.zoomWien();
		this.defaultAction();
		document.title="Jobpins Wien"
  },
  
  defaultAction: function(page) {
	  $(".documentdiv").empty();
	  $("#column1box").fadeIn('slow');
    Searches.searchInactiv();
    document.title="Jobpins"
  },
  
  
});
