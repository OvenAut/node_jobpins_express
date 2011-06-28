$(document).ready(function() {
	
  window.Info = new InfoView;
  window.Map = new MapView;
	window.App = new AppView;
	window.Controller = new restfulApp;

		Backbone.emulateHTTP = true;
		Backbone.emulateJSON = true 
		Backbone.history.start();
});
