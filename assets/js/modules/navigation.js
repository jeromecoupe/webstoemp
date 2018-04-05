"use strict";

/**
 * Variables (DOM elements)
 */

const menuLink = document.querySelector(".js-mainnav-compact > a");
const menu = document.querySelector(".js-mainnav");
const hideClass = "js-is-hidden";
const showClass = "js-is-visible";

/**
 * Initialise
 */

function init() {
  // hide nav
  menu.classList.add("js-is-hidden");

  // add event listener
  menuLink.addEventListener(
    "click",
    function(el) {
      _showhide(menu);
      el.preventDefault();
    },
    false
  );
}

/**
 * toggle classes
 */

function _showhide(el) {
  if (el.classList.contains(hideClass)) {
    el.classList.remove(hideClass);
    el.classList.add(showClass);
  } else {
    el.classList.remove(showClass);
    el.classList.add(hideClass);
  }
}

export { init };
