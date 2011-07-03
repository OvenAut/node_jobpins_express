/**
	+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    Backbone Document Collection
	+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
**/
	
	window.DocumentList = Backbone.Collection.extend({
		renderBang: function(document) {
			this.render(document,true);
		},
		
		render: function(document,bang) {
			
			var Document = {}
			Document.id = document;
			Document.list = Searches.get(document);
			
			Document.keys = _.keys(Document.list.attributes.couchids);			
			Document.keys.sort();
			Document.docOpen = Document.list.attributes.docOpen;
			Document.index = _.indexOf(Document.keys,Document.docOpen);
			
			if (!bang) {
			if (!this.prepare(Document)) return;
		  };
			
			if(!Document.list.attributes.docActiv) Searches.isActiv(document);
			
			//console.log(Document);


			Document.renderData = Document.list.attributes.couchids[Document.docOpen];
			Document.renderData.index = Document.index;
			Document.renderData.next = Document.index<Document.keys.length-1? Document.index+1:Document.keys.length-1;
			Document.renderData.last = Document.index>0? (Document.index-1) : 0 ;
			Document.renderData.urlname = "#!/categories/" + encodeURIComponent(Document.list.attributes.content);
			Document.renderData.color = Document.list.attributes.color;

			var view = new DocumentView({model: Document.renderData});
			if (Document.renderData.body) {
				$(".documentdiv").html(view.render().el);
			};
		},
		
		
		prepare: function(Document) {
			var pageGetIo = [];
			var pageKey;
			var pageCounter = Document.index;
			while (pageGetIo.length<3 && pageCounter < Document.keys.length) {
				pageKey = Document.keys[pageCounter];
				if (typeof Document.list.attributes.couchids[pageKey].updated_at == 'undefined') {
					pageGetIo.push(pageKey);
				}
				pageCounter++;
			}
			if (!!pageGetIo.length) socket.socketSend({key:pageGetIo,id:Document.id},"getDocData");
			if (typeof Document.list.attributes.couchids[Document.keys[Document.index]].updated_at == 'undefined') return false
			return true
		},
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
		initialize: function() {
			_.bindAll(this, 'render');
		},
		render: function() {
			$(this.el).html(this.template(this.renderAttributes(this.model)));
			return this;
		},
		
		renderAttributes: function(data) {
			var altText = "",
			    text ="",
			    back = "<<",
			    forth = ">>";
			
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
					backText:back,
					forthText:forth,
					employment:"",
					education:"",
					joblocation:""	
				};
				} else { 
					text = data.company;
					if (text.length > 37) {
						altText = text;
						//var text = data.content.replace(/.{21}(.*)/,"...");
						text = text.slice(0,33);
					  text = text + "...";
					}
				};
				//console.log(this);
			return {
				body:data.body.replace(/\n/g,"<br>"),
				company:text,
				last:data.last,
				next:data.next,
				index:data.index,
				urlname:data.urlname,
				formatted_address:data.formatted_address,
				color:data.color,
				backText:back,
				forthText:forth,
				employment:data.employment,
				education:data.education,
				joblocation:data.joblocation,
			}
		},		
	});


