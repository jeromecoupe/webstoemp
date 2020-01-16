const elNavLinks = document.querySelectorAll(".js-navtrigger");
const elBody = document.querySelector("body");
const classActive = "js-menu-is-active";

// init
function init() {
  for (let i = 0; i < elNavLinks.length; i++) {
    let el = elNavLinks[i];
    el.addEventListener(
      "click",
      event => {
        event.preventDefault();
        elBody.classList.toggle(classActive);
      },
      false
    );
  }
}

export { init };
