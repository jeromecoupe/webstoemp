const elNavLinks = document.querySelectorAll(".js-navtrigger");
const elBody = document.querySelector("body");
const elHtml = document.querySelector("html");
const classActive = "js-menu-is-active";
const classNoScroll = "u-noscroll";

// init
function init() {
  for (let i = 0; i < elNavLinks.length; i++) {
    let el = elNavLinks[i];
    el.addEventListener(
      "click",
      (event) => {
        event.preventDefault();
        elBody.classList.toggle(classActive);
        elHtml.classList.toggle(classNoScroll);
      },
      false
    );
  }
}

export { init };
