/**
 * cbpAnimatedHeader.js v1.0.0
 * http://www.codrops.com
 *
 * Licensed under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 * 
 * Copyright 2013, Codrops
 * http://www.codrops.com
 */


require(['./classie'], function(classie) {
	
	var cbpAnimatedHeader = (function() {
	
		var docElem = document.documentElement,
			header = document.querySelector( '.navbar-default' ),
			headernav = document.querySelector('.navbar-right'),
			didScroll = false,
			changeHeaderOn = 1;
	
		function init() {
			window.addEventListener( 'scroll', function( event ) {
				if( !didScroll ) {
					didScroll = true;
					setTimeout( scrollPage, 250 );
				}
			}, false );
		}
	
		function scrollPage() {
			var sy = scrollY();
			if ( sy >= changeHeaderOn ) {
				classie.add( header, 'navbar-shrink' );
				classie.add( headernav, 'navbar-shrink');
			}
			else {
				classie.remove( header, 'navbar-shrink' );
				classie.remove( headernav, 'navbar-shrink');
			}
			didScroll = false;
		}
	
		function scrollY() {
			return window.pageYOffset || docElem.scrollTop;
		}
	
		init();
	})();

});


