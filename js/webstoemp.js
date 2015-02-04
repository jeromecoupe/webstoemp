/*! apollo.js v1.7.0 | (c) 2014 @toddmotto | https://github.com/toddmotto/apollo */
(function (root, factory) {

  'use strict';

  if (typeof define === 'function' && define.amd) {
    define(factory);
  } else if (typeof exports === 'object') {
    module.exports = factory;
  } else {
    root.apollo = factory();
  }
})(this, function () {

  'use strict';

  var apollo = {};

  var hasClass, addClass, removeClass, toggleClass;

  var forEach = function (items, fn) {
    if (Object.prototype.toString.call(items) !== '[object Array]') {
      items = items.split(' ');
    }
    for (var i = 0; i < items.length; i++) {
      fn(items[i], i);
    }
  };

  if ('classList' in document.documentElement) {
    hasClass = function (elem, className) {
      return elem.classList.contains(className);
    };
    addClass = function (elem, className) {
      elem.classList.add(className);
    };
    removeClass = function (elem, className) {
      elem.classList.remove(className);
    };
    toggleClass = function (elem, className) {
      elem.classList.toggle(className);
    };
  } else {
    hasClass = function (elem, className) {
      return new RegExp('(^|\\s)' + className + '(\\s|$)').test(elem.className);
    };
    addClass = function (elem, className) {
      if (!hasClass(elem, className)) {
        elem.className += (elem.className ? ' ' : '') + className;
      }
    };
    removeClass = function (elem, className) {
      if (hasClass(elem, className)) {
        elem.className = elem.className.replace(new RegExp('(^|\\s)*' + className + '(\\s|$)*', 'g'), '');
      }
    };
    toggleClass = function (elem, className) {
      (hasClass(elem, className) ? removeClass : addClass)(elem, className);
    };
  }

  apollo.hasClass = function (elem, className) {
    return hasClass(elem, className);
  };

  apollo.addClass = function (elem, classes) {
    forEach(classes, function (className) {
      addClass(elem, className);
    });
  };

  apollo.removeClass = function (elem, classes) {
    forEach(classes, function (className) {
      removeClass(elem, className);
    });
  };

  apollo.toggleClass = function (elem, classes) {
    forEach(classes, function (className) {
      toggleClass(elem, className);
    });
  };

  return apollo;

});

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