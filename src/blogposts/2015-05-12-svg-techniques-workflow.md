---
title: "My current SVG techniques and workflow"
excerpt: "SVG is certainly the new hotness to get to grips with in the front-end world. Here are various use cases I encountered and the techniques and workflow I use with SVG today."
image: "svg.jpg"
imageAlt: "Vectors and bezier curves"
tags:
- Front-end
- SVG
---

Given the multi-devices, multi-screen-resolutions web we currently live in, the SVG format has gained a lot of traction. Browser support has also reached a point where it becomes realistic to use it in producton. Here is a quick rundown of the various use cases I have encountered and how I deal with them in the framework of a CMS or static site generator environment.

## User uploaded SVG assets

Whether you use a database-driven system like [Craft](http://buildwithcraft.com) or a file-based one like [Statamic](http://statamic.com/) or [Jekyll](http://jekyllrb.com/), the first use case that always comes up is how to deal with user uploaded content.

I tend to use a deceivingly (boringly) simple approach based on custom fields and on the source swapping capabilities of [the new `<picture>` element](http://responsiveimages.org/). Whenever I need to cater for user-uploaded files that would benefit from an SVG format, I create a data structure where the client has to upload both an SVG and a PNG files.

Then, I just use the `<picture>` element and the source-swapping capabilities it offers via the `<source>` elements.

```html
<picture>
  <source type="image/svg+xml" srcset="svgimage.svg">
  <img src="pngimage.png" class="fluidimg" alt="alt text for image">
</picture>
```

Browsers that do not support SVG will fallback to the PNG image. For the moment, you need [picturefill](http://scottjehl.github.io/picturefill/) to get broad support. A small hack is also needed to make it work in IE9. All well worth it if you ask me.

```html
<picture>
  <!--[if IE 9]><video style="display: none;"><![endif]-->
  <source type="image/svg+xml" srcset="svgimage.svg">
  <!--[if IE 9]></video><![endif]-->
  <img src="pngimage.png" class="fluidimg" alt="alt text for image">
</picture>
```

## Static design elements

Next up are what I call static design elements. A prime example here would be icons that do not need any kind of animation, the type of assets you would previously have handled with iconfonts.

For those, I currently use external SVG spritemaps that will get cached by browsers and thus only downloaded once. They are perfect for a simple icon system. As with anything SVG related these days, the one and only [Sara Soueidan](http://sarasoueidan.com/) has written [a great article on SVG sprites](http://24ways.org/2014/an-overview-of-svg-sprite-creation-techniques/) for the 2014 edition of 24 ways. I have settled on referencing an external SVG sprite with `<use>` and IDs (or fragment identifiers).

Workflow-wise, this is a very simple technique if you already use some kind of build tool (I currently use Gulp). The only thing you have to do is to use a plugin called [svg-store](https://github.com/w0rm/gulp-svgstore) and to configure a task similar to this one for the magic to happen.

```javascript
gulp.task('spritesvg', function () {
  return gulp.src('./public/img/svg/sprite_sources/*.svg')
  .pipe(svgstore())
  .pipe(rename("svgsprite.svg"))
  .pipe(gulp.dest('./public/img/svg/sprite/'))
  .pipe(notify({ message: 'SVG sprite created' }));
});
```

This plugin will take the svg files you have exported from Sketch or Illustrator as input and output a single SVG sprite combining them all as `<symbol>` elements with id attributes corresponding to the filenames of the SVG files you used as sources.

You can then refer to those IDs when you use the SVG spritemap in your HTML code and the corresponding part of the spritemap will be displayed. You have to specify a width and a height in your HTML but you can change those values using CSS in a responsive project without any problem.

```html
<svg width="12" height="10" role="img" title="Email icon"><use xlink:href="/img/svg/sprite/svgsprite.svg#icon_email"></use></svg>
```

The only thing left to do is to add the handy [SVG for Everybody](https://github.com/jonathantneal/svg4everybody) by Jonathan Neal to your templates to enjoy full support in IE9 through IE11. I don't generally bother that much with IE8 anymore but supporting it is easy enough, provided that you export PNG versions of your assets as well.

## Animated icons with CSS transitions

Next up are more complex icons or UI elements where you want to use CSS animations or transitions coupled with SVG-specific CSS properties. For those, I typically use inline SVG files and manage transitions and animations in my CSS.

After exorting the SVG from Sketch, I use SVGO (part of gulp-imagemin) with the following settings to clean them up:

```javascript
gulp.task('img', function() {
  return gulp.src('./img/**/*')
  .pipe(imagemin({
    progressive: true,
    svgoPlugins: [ {removeViewBox:false}, {removeUselessStrokeAndFill:false} ]
  }))
  .pipe(gulp.dest('./img/'))
  .pipe(notify({ message: 'Images task done' }));
});
```

For convenience's sake I usually keep the exported and optimised SVG around but store the SVG code as partials / includes in my CMS. That allows for easy inclusion anywhere in my code base, keeps the bloat of SVG files out of my templates and preserve the [accessibility-related enhancements](http://www.sitepoint.com/tips-accessible-svg/) I make when SVGO cleans the files. If I modify those, I just copy the paths and shapes from the cleaned up sources back to my partials.

Using CSS animations and transitions with inline SVGs is trivial. All it takes is adding some classes to svg paths, elements or groups and then referencing those classes in your CSS files, using SVG specific properties.

Here is a small example of what you would write in your CSS / Sass

```scss
.icon
{
  display: inline-block;
}

.icon__background
{
  stroke: black;
  fill: transparent;
  transition: all 0.2s linear;

  a:hover &
  {
    stroke: red;
  }
}

.icon__content
{
  fill: black;
  transition: all 0.2s linear;

  a:hover &
  {
    fill: red;
  }
}
```

## Bigger and more complex animations

There are times when you will want to use SVG to create bigger, more complex animations. If those are purely decorative and you are ok with them not being supported by any flavour of Internet Explorer (which will get the static version of your SVG), then SMIL animations are a good option.

If you want to dabble into SMIL, [Sara Soueidan wrote a detailed guide for CSS-tricks](https://css-tricks.com/guide-svg-animations-smil/ "The SVG princess strikes again") that I cannot recommend enough. Worth it as well are the [SMIL guide by the fine folks at MDN](https://developer.mozilla.org/en-US/docs/Web/SVG/SVG_animation_with_SMIL) and, if you are feeling a bit more adventurous, [the SMIL spec at the W3C](http://www.w3.org/TR/2001/REC-smil-animation-20010904/#AdditiveAnim).

The two gotchas that tripped me up with SMIL animations:

1. if you want to animate the same element in two different ways, you have to explicitely say that your animations sould be cumulative using [the `additive="sum"` attribute](http://www.w3.org/TR/2001/REC-smil-animation-20010904/#AdditiveAnim).
2. The way the SVG coordinate system works was not very intuitive to me. Luckily, the inavoidable Sara Soueidan [comes to our rescue again](http://sarasoueidan.com/blog/svg-coordinate-systems/) with [a "trifecta"](http://sarasoueidan.com/blog/svg-transformations/) on the [subject](http://sarasoueidan.com/blog/nesting-svgs/).

If SMIL is not your cup of tea or if you need broader browser support, there are several Javascript librairies that will fill the gap nicely: [Snap.svg](http://snapsvg.io/), [GSAP](http://greensock.com/get-started-js) or [Velocity.js](http://julian.com/research/velocity/) would be your best bets.

## Conclusion

SVG is (finally) ready for prime time. I found myself using SVG more and more in various projects lately. I still consider myself to be in the discovery phase but I am pretty happy with my current workflow. As with all things web, I probably will not be anymore in a couple of months, though. How are you integrating SVG in your projects?
