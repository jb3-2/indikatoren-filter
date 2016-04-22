
jQuery(function($) {

	// common function to check if element exists
	$.fn.exists = function(callback) {
		var args = [].slice.call(arguments, 1);

		if (this.length) {
			callback.call(this, args);
		}

		return this;
	};
	/* Usage
		$('div.test').exists(function() {
			this.append('<p>I exist!</p>');
		});
	*/

	// inject .svg images
	/* has to be at the end, after svg or use $(document).ready() */
	$(document).ready(function(){
		// Elements to inject
		var mySVGsToInject = document.querySelectorAll('img.inject-me');
		// Do the injection
		SVGInjector(mySVGsToInject);
	});

	$('*[rel=tooltip]').tooltip();
	$(function () {
		$('[data-toggle="tooltip"]').tooltip()
	});

});
