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

      //hide menu
      apollo.addClass(menu, 'js-is-hidden');
      menuState = 'closed';

      //bind actions
      bindActions();
    }

  };

  //bind navigation actions
  var bindActions = function() {

    menuLink.addEventListener('click', function(e) {

      toggleMenu();
      e.preventDefault();

    }, false);

  };

  //toggle menu
  var toggleMenu = function() {

    //swap classes
    if (menuState === 'closed' ){
      apollo.removeClass(menu, 'js-is-hidden');
      apollo.addClass(menu, 'js-is-visible');
      menuState = 'open';
    } else {
      apollo.removeClass(menu, 'js-is-visible');
      apollo.addClass(menu, 'js-is-hidden');
      menuState = 'closed';
    }

    console.log(menuState);

  };

  //make init publicly accessible
  return {
    initNav:initNav
  };

}());

myNavigation.initNav();
