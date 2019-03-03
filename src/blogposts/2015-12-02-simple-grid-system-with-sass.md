---
title: "Building a simple grid system with Sass"
excerpt: "Grid systems are great. With the help of Sass, it is now relatively trivial to build your own, tailor-made to the needs of your project and free of the cruft coming with one size fits all systems."
image: "grid.jpg"
imageAlt: "Gray metal cube container - Photo by Ilze Lucero"
categories:
- Front-end
- Grids
- Sass
- CSS
---

When building a website, being able to rely on a grid system allows for faster development and more consistency: grids are good.

But, if you settle on using one of the [numerous](http://csswizardry.com/csswizardry-grids/) [grid](http://neat.bourbon.io/) [frameworks](http://getbootstrap.com/css/#grid) out there, you will have to agree with a lot of choices made for you and have to surrender a bit of the control you have over your codebase.

At the other end of the spectrum, highly configurable dedicated grid systems like [Suzy](http://susy.oddbird.net/) are great but a bit oversized for my needs on most projects.

Fortunately, with tools like Sass, developing your own grid system has become easy. Here is the approach I have been using lately.

## A few bias on grids

As far as grids go, I'd like to get a few of my own personal bias out of the way first.

1. I like nestable fluid grids with fixed gutters. Enough said.
2. I am more comfortable with proportional grids where classes like `.grid__unit--3of10` means *"span [proportion] of your parent's width"*. I find those types of grids more suitable to responsive mobile first projects. You guessed it, I also happen to like BEM-inspired naming conventions.
2. The trade-offs involved in using `inline-block` grids (dealing white-space in code) feel less annoying to me that the ones involved in using `float` grids (clearing, no vertical alignment, no horizontal centering). `flexbox` based grids are the ideal solution when your project allows you to drop support for IE9. [Autoprefixer](https://github.com/postcss/autoprefixer) makes dealing with the multiple syntaxes trivial. That being said, if you like float-based grid system, the approach detailed in this post can be easily adapated.
3. Last but not least, I like to use non-semantic grid classes in my HTML rather than using `%placeholders` and `@extend` all over the place, which is [causing more problems than it solves](http://csswizardry.com/2014/11/when-to-use-extend-when-to-use-a-mixin/) in my opinion. I also keep all my grid classes on a separate "layer", something I have set out to do after seeing [this talk by Harry Robert](https://vimeo.com/44773888) back in 2012.

Now that you know all my dirty little grid secrets, let's get to work!

## Building a Sass grid system

Our goal here is to create a simple `inline-block`-based grid system that we can use and adapt from project to project. Here are the steps we will follow:

1. create the variables we need: number of units (number), size of gutters (string) and definition of our media-queries (nested maps)
2. create our default grid classes
3. for each of our breakpoints, create namespaced grid classes nested in a media query corresponding to our breakpoint.

We want our Sass to generate the following classes for us:

```scss
.grid
{
  list-style: none;    // works with lists too
  margin: 0;           // works with lists too
  padding: 0;          // works with lists too
  margin-left: -30px;  // clear gutters
}

.grid__unit
{
  display: inline-block;
  vertical-align: top;
  box-sizing: border-box;
  width: 100%;
  padding-left: 30px;  // create gutters
}

// base grid classes
.grid__unit--1of12
{
  width: 8.333333333%;
}

.grid__unit--2of12
{
  width: 16.666666667%;
}

// ... [more classes] ...

.grid__unit--12of12
{
  width: 100%;
}

// medium grid classes
@media all and (min-width: 46.875em)
{
  .grid__unit--medium-1of12
  {
    width: 8.333333333%;
  }

  // ... [more classes] ...

  .grid__unit--medium-12of12
  {
    width: 100%;
  }
}

// large grid classes
@media all and (min-width: 64em)
{
  .grid__unit--large-1of12
  {
    width: 8.333333333%;
  }

  // ... [more classes] ...

  .grid__unit--large-12of12
  {
    width: 100%;
  }
}
```

So in our HTML, provided we have defined a medium breakpoint, we could just write the following to build a responsive reflowing grid of six items. The comments in the code are there to deal with the whitespace in an inline-block context. I warned you didn't I?

```html
  <ul class="grid">
    <li class="grid__unit  grid__unit--6of12  grid__unit--medium-4of12">item</li><!--
 --><li class="grid__unit  grid__unit--6of12  grid__unit--medium-4of12">item</li><!--
 --><li class="grid__unit  grid__unit--6of12  grid__unit--medium-4of12">item</li><!--
 --><li class="grid__unit  grid__unit--6of12  grid__unit--medium-4of12">item</li><!--
 --><li class="grid__unit  grid__unit--6of12  grid__unit--medium-4of12">item</li><!--
 --><li class="grid__unit  grid__unit--6of12  grid__unit--medium-4of12">item</li>
  </ul>
```

### Our variables

Let's start by creating the variables we need to define the characteristics of our grid. The `!default` flag is used so that we can override those in a `_variables.sass` files down the line if needs be. We'll also go ahead and create the base CSS rules we need for `.grid` and `.grid__unit`.

```scss
// grid variables
$grid-units: 12 !default;
$grid-gutter: 30px !default;

// grid breakpoints (nested maps)
$grid-breakpoints: (
  medium: (
    media: "all",
    query: "(min-width: 46.875em)",
  ),
  large: (
    media: "all",
    query: "(min-width: 64em)",
  ),
  xlarge: (
    media: "all",
    query: "(min-width: 71.25em)",
  )
) !default;

.grid
{
  list-style: none;
  margin: 0;
  padding: 0;
  margin-left: ($grid-gutter * -1);
}

.grid__unit
{
  display: inline-block;
  vertical-align: top;
  box-sizing: border-box;
  padding-left: $grid-gutter;
  width: 100%;
}
```

We then go ahead and tell Sass to create our base grid classes with a simple `for` loop. No namespacing and no media-queries involved so far.

```scss
// grid variables
$grid-units: 12 !default;
$grid-gutter: 30px !default;

// grid breakpoints (nested maps)
$grid-breakpoints: (
  medium: (
    media: "all",
    query: "(min-width: 46.875em)",
  ),
  large: (
    media: "all",
    query: "(min-width: 64em)",
  ),
  xlarge: (
    media: "all",
    query: "(min-width: 71.25em)",
  )
) !default;

.grid
{
  list-style: none;
  margin: 0;
  padding: 0;
  margin-left: ($grid-gutter * -1);
}

.grid__unit
{
  display: inline-block;
  vertical-align: top;
  box-sizing: border-box;
  padding-left: $grid-gutter;
  width: 100%;
}

// create base grid classes
@for $i from 1 through $grid-units
{
  .grid__unit--#{$i}of#{$grid-units}
  {
    width: percentage( $i / $grid-units );
  }
}
```

We will then walk our `$grid-breakpoints` map and, for each breakpoint, we will create namespaced grid classes in a media-query.

```scss
// grid variables
$grid-units: 12 !default;
$grid-gutter: 30px !default;

// grid breakpoints (nested maps)
$grid-breakpoints: (
  medium: (
    media: "all",
    query: "(min-width: 46.875em)",
  ),
  large: (
    media: "all",
    query: "(min-width: 64em)",
  ),
  xlarge: (
    media: "all",
    query: "(min-width: 71.25em)",
  )
) !default;

.grid
{
  list-style: none;
  margin: 0;
  padding: 0;
  margin-left: ($grid-gutter * -1);
}

.grid__unit
{
  display: inline-block;
  vertical-align: top;
  box-sizing: border-box;
  padding-left: $grid-gutter;
  width: 100%;
}

// create base grid classes
@for $i from 1 through $grid-units
{
  .grid__unit--#{$i}of#{$grid-units}
  {
    width: percentage( $i / $grid-units );
  }
}

// create media queries and namespaced grid classes for each breakpoints
@each $name, $values in $grid-breakpoints
{
  // get values from nested maps
  $mq-name: $name;
  $mq-media: map-get($values, media);
  $mq-query: map-get($values, query);

  // write a media query for each breakpoint
  @media #{$mq-media} and #{$mq-query}
  {
    // loop from 1 to x grid units
    @for $i from 1 through $grid-units
    {
      // write namespaced grid classes in each media query
      .grid__unit--#{$mq-name}-#{$i}of#{$grid-units}
      {
        width: percentage( $i / $grid-units );
      }
    }
  }
}
```

We just created a simple grid system using Sass in about 50 lines of code. One that we have full control over, that fits our own grid bias and that we can easily adapt to the needs of most projects.

In fact, I have been using a beefed up version of this grid system in all my projects for a while now. It is [available on Github](https://github.com/jeromecoupe/sassgrids) so you can take a peek at the code, try the flexbox branch, fork it and adapt it to your needs or file an issue if you find something strange.
