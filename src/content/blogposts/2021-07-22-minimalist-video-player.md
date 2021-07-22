---
title: "Minimalist video player"
excerpt: "For a recent project, I needed a minimalist video player for services like Youtube and Vimeo. The objectives were to wait for user interaction to load videos, have a custom cover image and build a straightforward and maintainable solution."
image: "videoplayer.jpg"
imageAlt: "Clap - Photo by Donovan Silva on Unsplash"
tags:
  - Front-end
  - Video
  - Youtube
  - Vimeo
---

## Objectives

The website I was working on could potentially have up to 12 video players on a single page. For performance reasons, I didn't want to load all these `iframe` and their content on first load. The client also wanted their videos to have a custom cover image and was using Vimeo and Youtube as video services.

On my side, I wanted to come up with something simple to maintain and that didn't depend on the ever-changing APIs of these services. I also wanted a fallback in the form of a link to these video services if the JavaScript didn't work or was not loaded.

Since I was going for a progressively enhanced solution, I settled on JavaScript modules as my cut the mustard test and checked for `template` tag support on top of that.

## HTML foundations

I started with some (hopefully) semantic HTML code:

- a working link to the video on the relevant service
- a responsive cover image
- data attributes to store the id of the video and the video service (used to dynamically create the `iframe` relevant `src` value with JavaScript)

```html
<div class="c-videoplayer  js-video-player" data-video-service="vimeo" data-video-id="174919644">
  <a class="c-videoplayer__link  js-video-link" href="https://vimeo.com/174919644" aria-label="play video: video title">
    <img src="https://picsum.photos/id/239/600/338"
         srcset="https://picsum.photos/id/239/600/338 600w,
                 https://picsum.photos/id/239/800/450 800w"
         sizes="(min-width: 1440px) 720px,
               (min-width: 750px) 50vw,
               100vw"
         class="c-videoplayer__cover"
         loading="lazy"
         decoding="async"
         alt="">
  </a>
  <template class="js-video-template">
    <iframe src="" allow="autoplay; fullscreen" allowfullscreen></iframe>
  </template>
</div>
```

I decided to have a `template` tag wrapped around the `iframe` to prevent it from rendering on page load. While it is certainly possible to generate the `iframe` entirely in JavaScript, it made more sense to me to have as much of the markup as possible in the HTML.

I also included that template inside every video player to make it more of a self-contained "component".

## Add some CSS

In terms of styles, the player needed to always have an aspect ratio of 16 by 9. The link or the `iframe` could then be absolutely positioned relative to the player to fill all the available space. A custom SVG "play" icon can be thrown in using generated content.

```css
/* --------------------------------
videoplayer
-------------------------------- */

.c-videoplayer {
  position: relative;
  background-color: black;
  aspect-ratio: 16 / 9;
  background: #000000;
}

@supports not (aspect-ratio: 16 / 9) {
  .c-videoplayer {
    padding-top: 56.25%;
  }
}

.c-videoplayer__link,
.c-videoplayer > iframe {
  border: none;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.c-videoplayer__link::after {
  content: "";
  position: absolute;
  top: 50%;
  left: 50%;
  width: 60px;
  height: 60px;
  transform: translate3d(-50%, -50%, 0);
  background-image: url(../img/icon_play.svg);
  background-position: 50% 50%;
  background-repeat: no-repeat;
  background-size: cover;

  transition: transform 0.2s ease-out;
}

@media all and (min-width: 500px) {
  .c-videoplayer__link::after {
    width: 72px;
    height: 72px;
  }
}

.c-videoplayer__link:hover::after,
.c-videoplayer__link:focus::after {
  transform: translate3d(-50%, -50%, 0) scale(1.1);
}

.c-videoplayer__cover {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: opacity 0.2s ease-out;
}

.c-videoplayer__link:hover > .c-videoplayer__cover,
.c-videoplayer__link:focus > .c-videoplayer__cover {
  opacity: 0.72;
}
```

We now have a working baseline in the form of an humble anchor tag wrapped around a responsive cover image and linking to the video on the relevant video service.

We can now add a layer of JavaScript to replace that link with a fully functional `iframe` when the link is clicked.

## A sprinkle of JS

If we break down what our JavaScript code needs to accomplish, here is what we come up with:

- test if the browser supports the `template` element (and bail out if it does not)
- use the values of the `data-video-service` and `data-video-id` attributes to create the relevant `src` value for the `iframe`
- grab the `template` and import its content
- generate and add the relevant `src` value to the `iframe`
- replace the link with a functional iframe when the link is clicked

```js
/**
 * CSS selectors
 */
const SELECTORS = {
  player: ".js-video-player",
  link: ".js-video-link",
  template: ".js-video-template",
};

/**
 * Check if HTML templates are supprted
 * @returns {Boolean} is template tag supported
 */
function supportsTemplate() {
  return "content" in document.createElement("template");
}

/**
 * Build iframe src value
 * @param {String} videoService
 * @param {String} videoId
 * @returns {String} src url for iframe
 */
function getIframeSrc(videoService, videoId) {
  let iframeSrc = "";
  if (videoService === "youtube") {
    iframeSrc = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
  }
  if (videoService === "vimeo") {
    iframeSrc = `https://player.vimeo.com/video/${videoId}?color=e76c34&title=0&byline=0&portrait=0&autoplay=1`;
  }
  return iframeSrc;
}

/**
 * Get all players in the page
 * Swap the placeholder image and link for a video iframe
 */
function init() {
  // cut the mustard test
  if (!supportsTemplate()) {
    console.log("Your browser does not support the template tag");
    return;
  }

  // get all players
  const players = document.querySelectorAll(SELECTORS.player);

  // loop through players
  players.forEach((player) => {
    // get values
    const service = player.dataset.videoService;
    const id = player.dataset.videoId;

    // checks
    if (service !== "youtube" && service !== "vimeo") return;
    if (!id) return;

    // prepare iframe src and check
    const iframeSrc = getIframeSrc(service, id);
    if (iframeSrc === "") return;

    // get and import template
    const template = player.querySelector(SELECTORS.template);
    const templateContent = document.importNode(template.content, true);

    // get iframe
    const iframe = templateContent.querySelector("iframe");

    // add src to iframe
    iframe.src = iframeSrc;

    // get link
    const link = player.querySelector(SELECTORS.link);

    // when link is clicked,
    // replace placeholder with template
    link.addEventListener(
      "click",
      function (event) {
        event.preventDefault();
        link.replaceWith(templateContent);
      },
      false
    );
  });
}

export default init;
```

On the CMS or SSG side of things, we need the following pieces of data:

- a string to identify the service used to host the video
- the id of the video
- the title of the video
- a full URL to the video on Youtube or Vimeo (can be inferred from the ID and service)

We now have a minimalist customizable and maintainable video player falling back to a link wrapped around a responsive image. We can also have a page with many of those players without loading several `iframe` and their content when that page is initially loaded.

The main downside of using this method is that, using mobile browsers, videos will not autoplay, which means users will need to make two clicks to play them. To me, that's a very reasonable tradeoff to make.