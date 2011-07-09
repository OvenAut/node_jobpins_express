$(document).ready(function() {
	
  window.Info = new InfoView;
  window.Map = new MapView;
	window.App = new AppView;
	window.Controller = new restfulApp;

		//Backbone.emulateHTTP = true;
	  //Backbone.emulateJSON = true 
		Backbone.history.start();
		//  		$('[placeholder]').focus(function() {
		//   var input = $(this);
		//   if (input.val() == input.attr('placeholder')) {
		//     input.val('');
		//     input.removeClass('placeholder');
		//   }
		// }).blur(function() {
		//   var input = $(this);
		//   if (input.val() == '' || input.val() == input.attr('placeholder')) {
		//     input.addClass('placeholder');
		//     input.val(input.attr('placeholder'));
		//   }
		// }).blur();
		// 
});
