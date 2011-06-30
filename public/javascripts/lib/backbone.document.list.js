/**
	+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    Backbone Model Suggest                                               ++++
	+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
**/

  window.DocumentModel = Backbone.Model.extend({
	
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


window.DocumentListCollection = Backbone.Collection.extend({
	
	model: Search,
	
	//localStorage: new Store("document"),
	initialize: function(){

	},
	
	eprepare: function(id) {
		//console.log("prepare Docs");
		//console.log(id);
		Searches.isActiv(id);
		var documentList = Searches.get(id);
		var firstPage = documentList.attributes.docOpen;
		var Arraydocuments = _.keys(documentList.attributes.couchids);

		//console.log(firstPage);
		//documentList.attributes.couchids.body = "bala";
		//console.log(_.indexOf(Arraydocuments,firstPage));
		// documentList.set({
		//console.log(Arraydocuments);
		// 	couchids[0]: {body:blabla},
		// 	
		// });
		//console.log(documentList);
		var start = _.indexOf(Arraydocuments,firstPage);
		//var end = start +3;
		var pageGet = [];
		for (var i = start; i< start+3 ;i++) {
			if (Arraydocuments[i]) {
				var page = Arraydocuments[i];
				if (documentList.attributes.couchids[page].updated_at) {
					console.log("data");
					Documents.renderDoc(documentList.attributes.couchids[page]);
				} else {
					console.log("no data");
					pageGet.push(page);
				}
			}
		}
		//console.log(pageGet);
		if (pageGet.length>0) {
			console.log("sending getDocData " + id);
			socket.socketSend({key:pageGet,id:id},"getDocData");
			
		}
	},
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	Attributes: function(name,id,listid,InuseNameList) {
		//console.log(listid);
		//console.log(InuseNameList[name]);
		i=id;
		return { 
			id: i,
			name: name,
			selected:false,
			visible:true,
			inuse:InuseNameList[name]?true:false,//Searches.getName(name), //Searches.getName(name)?true:false,
		};
	},
	
	newList: function(data) {
		//console.dir(data);
		
		var InuseNameList = {};
		Searches.each(function (search) {
				InuseNameList[search.attributes.content] = true;
		});

		var i = 0,j;
		for (name in data) {
			this.add(this.Attributes(name,i++,data,InuseNameList));
		};
	  this.guiNotice(i,j);	
	},
	
	
	guiNotice: function(i,j) {
		var guiText = "Jobpins have " + i +" categories for you. Lastupdate(couchDB): " + j;	
		$('#new-search')[0].placeholder = "What you search for?";
	  $('div#slogen').animate({opacity:0.2},2000,function() {
				$('#slogen').text(guiText).animate({opacity:1},2000);
			});
		
	},
		
});


