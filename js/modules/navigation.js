if ('querySelector' in document && 'addEventListener' in window) {

	var myNavigation = (function () {

		'use strict';

		//set vars test
		var menuLink = document.querySelector('.js-mainnav-compact > a'),
				menu = document.querySelector('.js-mainnav'),
				menuState = 'closed';

		// initiate navigation
		var initNav = function() {

			apollo.addClass(menu, 'js-is-hidden');
			bindActions();

		};

		//bind navigation actions
		var bindActions = function() {

			menuLink.addEventListener('click', function(e) {

				toggleMenu(menuState);
				e.preventDefault();
				//console.log(menuState);

			}, false);

		};

		//toggle menu
		var toggleMenu = function(state) {

			//swap classes
			if (state === 'closed' ){
				apollo.removeClass(menu, 'js-is-hidden');
				apollo.addClass(menu, 'js-is-visible');
			} else {
				apollo.removeClass(menu, 'js-is-visible');
				apollo.addClass(menu, 'js-is-hidden');
			}

			// toggle menu state
			menuState = (state === 'closed') ? 'open' : 'closed';

		};

		//make init publicly accessible
		return {
			initNav:initNav
		};

	}());

	myNavigation.initNav();

}