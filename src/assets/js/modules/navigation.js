const elNavLinks = document.querySelectorAll(".js-navtrigger");
const mobileMenu = document.querySelector(".js-mobilemenu");
const elBody = document.querySelector("body");
const classActive = "is-active";
const classBodyScroll = "has-menu";

// init
const init = () => {
  for (let i = 0; i < elNavLinks.length; i++) {
    let el = elNavLinks[i];
    el.addEventListener(
      "click",
      (event) => {
        event.preventDefault();
        mobileMenu.classList.toggle(classActive);
        elBody.classList.toggle(classBodyScroll);
      },
      false
    );
  }
};

// exports
export { init };
