---
title: "Notes on using CSS Grid in production"
excerpt: "For the last 10 months or so, I have been building all new clients projects with CSS grid and flexbox as my main layout tools. Here is a quick rundown of the fallback tactics I use, in case it is useful for someone else."
image: "cssgrid.jpg"
imageAlt: "Grid pattern - Photo by Calvin Ma"
tags:
- CSS Grid
- CSS
- Front-end
---

CSS Grid and flexbox are the new tools web designers can work with for creating layouts. flexbox is well supported across the board and CSS grid support is great amongst evergreen desktop browsers, but less so with legacy ones.

What approaches can we use ?

## Consider layout as progressive enhancement

For some projects, and that number can be surprisingly high when you [give some context](http://dowebsitesneedtolookexactlythesameineverybrowser.com/), you can simply serve a linearised layout to browsers that do not support grid.

Back in the heyday of responsive web design, I settled on delivering (slightly tweaked) mobile layouts to browsers that did not support media queries. A similar approach can be taken for browsers not supporting CSS Grid.

That's what [Clearleft](https://clearleft.com/) is doing on their own website, in line with [Jeremy Keith's blogpost](https://adactio.com/journal/14131) on the topic. The website remains usable but its layout is (mostly) considered as an enhancement for legacy browsers. That's also the strategy I used on this very website. Feel free to check it out if you have a copy of IE 11 lying around.

## Serve legacy layouts to legacy browsers

For some projects, depending on your user statistics and your client, you might have to serve a fallback layout to legacy browsers. Here are various options I have used.

### Don't use grid

If most of your users are on IE 11 or, god forbid, IE 10, the simplest solution is to not use CSS Grid for layout. We have all used floats, inline-block or flexbox to create layouts in the past. If your main targets are legacy desktop browsers, those techniques remain perfectly valid options.

### Use Autoprefixer and IE Grid syntax

That approach has been [detailed on CSS Tricks](https://css-tricks.com/css-grid-in-ie-css-grid-and-the-new-autoprefixer/). It relies on the fact that IE 10 and IE 11 understand an old prefixed CSS Grid syntax that Autoprefixer can spit out for you. This approach can be useful in certain cases but has some drawbacks:

- No support for auto-placement of grid items
- If you need support for `grid-gap`, it is recommended to use `grid-template-areas` and `grid-area` for explicit placement.
- You only have access to a subset of CSS Grid features. You cannot use things like implicit grids, `repeat(auto-fit, ...)`, `repeat(auto-fill, ...)`, etc.

I went down the Autoprefixer route but that's not the approach I personally favour. I find it too limiting because it inevitably has to be a middle ground between a complex modern spec and what PostCSS can fix for legacy browsers without having access to the DOM.

### Use flexbox as a fallback

For legacy desktop browsers, we can start with a flexbox version of layout and override it with CSS grid wrapped in `@supports` for more capable browsers. When using that approach I have a short set of principles I try to enforce:

- Use flexbox as a fallback because it offers more possibilities than layouts relying on `float` / `clear`, `display: inline-block` or `display: table`.
- Separate concerns between the layout of components and the styling of their content.
- Wrap the whole CSS grid code in `@supports` statements. That makes it easier to come back and delete fallback code when the project does not need IE support.
- Group and comment flexbox overrides in my CSS Grid code (mainly `width`, `margin` and `padding`).
- Make sure the client and/or your boss understands that this approach is going to have an impact on development and testing time.

It is a verbose approach, but it makes sense for me if you have to serve layout to legacy browsers.

#### Start with utility grid classes

In any project I do, I generally have a bunch of responsive grid classes to create 2, 3 or 4 equal widths columns grids. That's easy enough to do with CSS Grid and auto placement. Adding a flexbox fallback is not that difficult either.

```scss
// -------------------------------------
// Settings
// -------------------------------------

$breakpoints-map: (
  small: (
    query: "all and (min-width: 500px)",
    generate-grids: true,
    generate-helpers: true
  ),
  medium: (
    query: "all and (min-width: 750px)",
    generate-grids: true,
    generate-helpers: true
  ),
  large: (
    query: "all and (min-width: 1100px)",
    generate-grids: true,
    generate-helpers: true
  )
) !default;

$grid-gap: 2rem !default;

// -------------------------------------
// Base flexbox classes
// -------------------------------------
.l-grid {
  list-style: none;
  margin: 0;
  padding: 0;

  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: stretch;
  flex-wrap: wrap;

  margin-left: ($grid-gap * -1);
}

.l-grid__unit {
  box-sizing: border-box;
  margin-bottom: $grid-gap;
  padding-left: $grid-gap;
  width: 100%;
}

.l-grid--2cols > .l-grid__unit {
  width: 50%;
}

.l-grid--3cols > .l-grid__unit {
  width: 33.33%;
}

.l-grid--4cols > .l-grid__unit {
  width: 25%;
}

// -------------------------------------
// Base grid classes
// -------------------------------------
@supports (display: grid) {
  .l-grid {
    display: grid;
    grid-template-columns: 1fr;
    grid-gap: $grid-gap;
  }

  .l-grid--2cols {
    grid-template-columns: repeat(2, 1fr);
  }

  .l-grid--3cols {
    grid-template-columns: repeat(3, 1fr);
  }

  .l-grid--4cols {
    grid-template-columns: repeat(4, 1fr);
  }

  // flexbox overrides
  .l-grid {
    margin-left: 0;
  }

  .l-grid__unit {
    margin-bottom: 0;
    padding-left: 0;
  }

  .l-grid--2cols > .l-grid__unit,
  .l-grid--3cols > .l-grid__unit,
  .l-grid--4cols > .l-grid__unit {
    width: auto;
  }
}

// -------------------------------------
// Responsive flexbox classes
// -------------------------------------

@each $breakpoint, $values in $breakpoints-map {
  $name: $breakpoint;
  $query: map-get($values, query);
  $generate-grids: map-get($values, generate-grids);

  @if ($generate-grids) {
    @media #{$query} {
      .l-grid--2cols\@#{$name} > .l-grid__unit {
        width: 50%;
      }

      .l-grid--3cols\@#{$name} > .l-grid__unit {
        width: 33.33%;
      }

      .l-grid--4cols\@#{$name} > .l-grid__unit {
        width: 25%;
      }
    }
  }
}

// -------------------------------------
// Responsive Grid classes
// -------------------------------------

@supports (display: grid) {
  @each $breakpoint, $values in $breakpoints-map {
    $name: $breakpoint;
    $query: map-get($values, query);
    $generate-grids: map-get($values, generate-grids);

    @if ($generate-grids) {
      @media #{$query} {
        .l-grid--2cols\@#{$name} {
          grid-template-columns: repeat(2, 1fr);
        }

        .l-grid--3cols\@#{$name} {
          grid-template-columns: repeat(3, 1fr);
        }

        .l-grid--4cols\@#{$name} {
          grid-template-columns: repeat(4, 1fr);
        }

        // flexbox overrides
        .l-grid--2cols\@#{$name} > .l-grid__unit,
        .l-grid--3cols\@#{$name} > .l-grid__unit,
        .l-grid--4cols\@#{$name} > .l-grid__unit {
          width: auto;
        }
      }
    }
  }
}
```

In your HTML you can just use the following and enjoy good cross-browser support:

```html
<ul class="l-grid  l-grid--2cols@small  l-grid--3cols@medium  l-grid--4cols@large">
  <li class="l-grid__unit"><!-- content --></li>
  <!-- [ other list items ] -->
  <li class="l-grid__unit"><!-- content --></li>
</ul>
```

#### Layouts for pages and components

When using CSS Grid for page or components layouts, I also use a flexbox fallback and `@supports` to serve a simple layout to IE 10 and IE 11.

Here is the HTML code:

```html
<footer class="c-sitefooter">
  <div class="c-sitefooter__grid  o-container">
    <div class="c-sitefooter__about">
      about
    </div>
    <div class="c-sitefooter__nav">
      nav
    </div>
    <div class="c-sitefooter__social">
      social
    </div>
    <div class="c-sitefooter__copyright">
      copyright
    </div>
  </div>
</footer>
```

And here is the CSS (well, the Sass actually):

```scss
// -------------------------------------
// Site Footer
// -------------------------------------

.c-sitefooter {
  padding-top: 2rem;
  padding-bottom: 1rem;
  background-color: #000000;
  color: #ffffff;
}

// -------------------------------------
// Flexbox layout
// -------------------------------------

.c-sitefooter__grid {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: stretch;
  flex-wrap: wrap;
}

@media all and (min-width: 750px) {
  .c-sitefooter__grid {
    flex-direction: row;
  }

  .c-sitefooter__about {
    box-sizing: border-box;
    padding-right: 2rem;
    width: 40%;
  }

  .c-sitefooter__nav {
    box-sizing: border-box;
    padding-right: 2rem;
    width: 30%;
  }

  .c-sitefooter__social {
    width: 30%;
  }

  .c-sitefooter__copyright {
    width: 100%;
  }
}

// -------------------------------------
// Grid layout
// -------------------------------------

@supports (display: grid) {
  .c-sitefooter__grid {
    display: grid;
    grid-template-columns: 1fr;
    grid-template-areas:
      "about"
      "nav"
      "social"
      "copyright";
    grid-gap: 2rem;

    @media all and (min-width: 750px) {
      grid-template-columns: 4fr 3fr 3fr;
      grid-template-areas:
        "about nav social"
        "copyright copyright copyright";
    }

    @media all and (min-width: 1100px) {
      grid-template-columns: 5fr 3fr 2fr;
    }
  }

  .c-sitefooter__about {
    grid-area: about;
  }

  .c-sitefooter__nav {
    grid-area: nav;
  }

  .c-sitefooter__social {
    grid-area: social;
  }

  .c-sitefooter__copyright {
    grid-area: copyright;
  }

  // flexbox overrides
  .c-sitefooter__about,
  .c-sitefooter__nav,
  .c-sitefooter__social,
  .c-sitefooter__copyright {
    padding-right: 0;
    width: auto;
  }
}
```

## Not too bad

Despite longing for the day we don't have to support old IE, I generally don't find it too hard to handle this new world of layout, while supporting legacy browsers.
