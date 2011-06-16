/**
	+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    Backbone Document Model                                               ++++
	+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
**/

  window.Document = Backbone.Model.extend({
	
	// toggle: function() {
	// 	//console.log("trigger");
	// 	//console.log(this);
	// 	this.set({selected: !this.get("selected")});
	// 
	// },
	// 
	// // get Collection -> delet Model ->save back
	// clearModel: function() {
	// 	//console.log(this);
	// 	this.clear({silent:true});
	// 	this.view.remove();
	// 	console.log("clear");
	// }
	// 
	
});

/**
	+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    Backbone Document Collection
	+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
**/
	
	window.DocumentList = Backbone.Collection.extend({
		/*
		query = {}
		deactiv
		color
		order
		*/
		//model:Search,
		
		render: function(document) {
			
			var Document = {}
			Document.id = document;
			Document.list = Searches.get(document);
			
			Document.keys = _.keys(Document.list.attributes.couchids);			
			Document.docOpen = Document.list.attributes.docOpen;
			Document.index = _.indexOf(Document.keys,Document.docOpen);
			
			this.prepare(Document);
			
			
			if(!Document.list.attributes.docActiv) Searches.isActiv(document);
			
			console.log(Document);


			Document.renderData = Document.list.attributes.couchids[Document.docOpen];
			Document.renderData.index = Document.index;
			Document.renderData.next = Document.index<Document.keys.length-1? Document.index+1:Document.keys.length-1;
			Document.renderData.last = Document.index>0? (Document.index-1) : 0 ;
			Document.renderData.urlname = "#!/categories/" + encodeURIComponent(Document.list.attributes.content);
			Document.renderData.color = Document.list.attributes.color;
			console.log("render");
			//console.log(Document.renderData);
			var view = new DocumentView({model: Document.renderData});
			//data[view.model.attributes.id] = view.model.attributes.content;
			if (Document.renderData.body) {
				$(".documentbox").html(view.render().el); // .render().elappend -> Insert contentm specified by the parameters, to the end of each elements in the set of matched elements
				$('.documentbody').slideDown('fast');
			};
		},
		
		
		prepare: function(Document) {
			console.log("prepare Docs");
			//console.log(id);



			//console.log(firstPage);
			//documentList.attributes.couchids.body = "bala";
			//console.log(_.indexOf(Arraydocuments,firstPage));
			// documentList.set({
			//console.log(Arraydocuments);
			// 	couchids[0]: {body:blabla},
			// 	
			// });
			//console.log(documentList);
			//var end = start +3;
			//console.log(Document);
			var pageGet = [];
			for (var i = Document.index; i< Document.index+3 ;i++) {
				if (Document.keys[i]) {
					var page = Document.keys[i];
					if (Document.list.attributes.couchids[page].updated_at) {
						console.log("data exists");
						//Documents.renderDoc(documentList.attributes.couchids[page]);
						//cb(page)
					} else {
						console.log("no data");
						pageGet.push(page);
					}
				}
			}
			//console.log(pageGet);
			if (pageGet.length>0) {
				console.log("sending getDocData " + Document.id + " page:" + pageGet);
				socket.socketSend({key:pageGet,id:Document.id},"getDocData");

			}
		},


		
		// model:Document,
		// 
		// localStorage: new Store("search"),
		// 
		// active: function() {
		// 	return this.filter(function(searchparam) {  //filter => array.filter(callback) 
		// 		return searchparam.get('active');
		// 	});
		// },
		// deactive: function() {
		// 	return this.without.apply(this, this.active());
		// },
		// 
		// nextOrder: function() {
		//   if (!this.length) return 1;
		//   return this.last().get('order') + 1;
		// },
		
	});
	
	
	
	
	window.Documents = new DocumentList;




	
/**
	+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++	
	  Backbone Document View
  +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
**/

	window.DocumentView = Backbone.View.extend({
		
		tagName: "div",
		
		template: _.template($('#document-template').html()),
		
		// events: {
		// 	"click .check"     : "toggleDone",
		// 	"dblclick div.search-content" : "edit",
		// 	"click span.search-destroy" : "clear",
		// 	"keypress .search-input"    : "updateOnEnter"
		// },
		// 
		initialize: function() {
			_.bindAll(this, 'render');
//			this.model.bind('change', this.render);
//			this.model.view = this;
			
		},
		// 
		render: function() {
			$(this.el).html(this.template(this.renderAttributes(this.model)));
			//this.setContent();
			
			return this;
		},
		
		renderAttributes: function(data) {
			//console.log(data);
			if(!data.body) {
				var data = {
					body:"Loading",
					company:"",
					last:"",
					next:"",
					index:"",
					urlname:"",
					formatted_address:"",
					color:"#fff",	
				};
				}
				console.log(this);
			return {
				body:data.body.replace(/\n/g,"<br>"),
				company:data.company,
				last:data.last,
				next:data.next,
				index:data.index,
				urlname:data.urlname,
				formatted_address:data.formatted_address,
				color:data.color,
			}
		},
		
		
		// setContent: function() {
		// 	// console.log("model");
		// 	// console.log(this);
		// 	var content = this.model.get('content');
		// 	this.$('.search-content').text(content);
		// 	this.input = this.$('.search-input');
		// 	this.input.bind('blur', this.close);
		// 	this.input.val(content);
		// },
		// 
		// toggleDone: function() {
		// 	this.model.toggle();
		// },
		// 
		// edit: function() {
		// 	$(this.el).addClass('editing');
		// 	this.input.focus();
		// },
		// 
		// close: function() {
		// 	this.model.save({content: this.input.val()});
		// 	$(this.el).removeClass('editing');
		// },
		// 
		// updateOnEnter: function(e) {
		// 	if (e.keyCode == 13) this.close();
		// },
		// 
		// clear: function() {
		// 	this.model.clear();
		// }
		// 		
		
	});


