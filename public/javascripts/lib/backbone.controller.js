var restfulApp = Backbone.Controller.extend({

	routes: {
			"!/categories/:content/:index":          "documentIndexAction",  //This matches app/animals/* and assigns * to a variable called "animal"
			//"/categories/:content":          "documentAction",  //This matches app/animals/* and assigns * to a variable called "animal"
			
			"*page":                 	"defaultAction", //This simply matches any urls that weren't caught above and assigns it to "page"
			},
  // documentAction: function(content,index) {
  // 
  // 	  content = decodeURIComponent(content);
  // 		var id = Searches.getId(content);
  // 	  	console.log(id + " " +content);
  // 		
  // 		//if (typeof id=="undefined")  window.location.href = "";
  // 
  // 		//Searches.
  //   Documents.render(id);
  // },
  documentIndexAction: function(content,index) {
	  if (index == "undefined") index = 0;
	  content = decodeURIComponent(content);	

		var id = Searches.getId(content);
  	console.log(id + " " +content + " " + index);
		if (typeof id=="undefined" || _.size(Searches.get(id).attributes.couchids) < index)  {
			window.location.href = "/#";
		  return;
		}
		//Searches.
		var Document = {};
		Document.attributes = Searches.get(id).attributes;
		Document.keys = _.keys(Document.attributes.couchids);
		//console.log("Documents key");
		Document.keys.sort();
		//console.log(Document.keys);
		//console.log("index: " + Document.keys[index]);
		Document.nextDoc = 		Document.keys[index];
		Document.attributes.docOpen = Document.nextDoc;
		Searches.get(id).attributes.docOpen = Document.nextDoc;
		//Searches.save({silent:true});
		//Document.attributes.save();
		//console.log(Document);
		
		Marker.gotoMarker(Document.attributes.couchids[Document.nextDoc]);
	  $("#column1box").fadeOut('slow');
	  //$(".documentbody").slideUp('fast',function() {
	  //});
    Documents.render(id);// body...
    
  },

  defaultAction: function(page) {
	  $(".documentdiv").empty();
	  $("#column1box").fadeIn('slow');
  	//console.log(page);
  },
  
  
});
