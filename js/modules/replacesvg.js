(function(){

	'use strict';

	if('querySelector' in document && !Modernizr.svg) {

		var els = document.querySelectorAll('.imgsvg');

		var index;
		for (index = 0; index < els.length; index++) {

			var src = els[index].src;
			//console.log(src);

			var newSrc = src.replace('.svg', '.png');
			//console.log(newSrc);

			els[index].src = newSrc;
		}

  }

})();