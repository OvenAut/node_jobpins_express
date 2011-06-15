var restfulApp = Backbone.Controller.extend({

	routes: {
			"categories/:content/:index":          "documentIndexAction",  //This matches app/animals/* and assigns * to a variable called "animal"
			"categories/:content":          "documentAction",  //This matches app/animals/* and assigns * to a variable called "animal"
			
			"*page":                 	"defaultAction", //This simply matches any urls that weren't caught above and assigns it to "page"
			},
  documentAction: function(content,index) {
	  content = decodeURIComponent(content);
		var id = Searches.getId(content);
  	console.log(id + " " +content);
		//Searches.
    Documents.render(id);
  },
  documentIndexAction: function(content,index) {
	  content = decodeURIComponent(content);
		var id = Searches.getId(content);
  	console.log(id + " " +content + " " + index);
		//Searches.
		var Document = {};
		Document.attributes = Searches.get(id).attributes;
		Document.keys = _.keys(Document.attributes.couchids);	
		Document.nextDoc = 		Document.keys[index];
		Document.attributes.docOpen = Document.nextDoc;
		console.log(Document);
		
		
    Documents.render(id);
  },

  defaultAction: function(page) {
  	console.log(page);
  },
  
  
});
