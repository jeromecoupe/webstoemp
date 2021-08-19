const elNavLinks = document.querySelectorAll(".js-navtrigger");
const mobileMenu = document.querySelector(".js-mobilemenu");
const elHtml = document.querySelector("html");
const classActive = "is-shown";
const classNoScroll = "u-noscroll";

// init
const init = () => {
  for (let i = 0; i < elNavLinks.length; i++) {
    let el = elNavLinks[i];
    el.addEventListener(
      "click",
      (event) => {
        event.preventDefault();
        mobileMenu.classList.toggle(classActive);
        elHtml.classList.toggle(classNoScroll);
      },
      false
    );
  }
};

// exports
export { init };
