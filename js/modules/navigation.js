var myNavigation = (function () {

  'use strict';

  //create vars
  var menuLink,
      menu,
      menuState;

  //check dependencies
  var checkDependencies = function() {
    return ('querySelector' in document && 'addEventListener' in window);
  };

  // initiate navigation
  var initNav = function() {

    if(checkDependencies())
    {
      // set vars
      menuLink = document.querySelector('.js-mainnav-compact > a');
      menu = document.querySelector('.js-mainnav');
      menuState = 'closed';

      //hide menu
      apollo.addClass(menu, 'js-is-hidden');

      //bind actions
      bindActions();
    }

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
