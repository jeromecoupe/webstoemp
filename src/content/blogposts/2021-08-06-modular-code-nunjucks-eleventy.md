---
title: "Modular code with Nunjucks and Eleventy"
excerpt: "These days, web development and design are all about modularization and components. Template languages have a lot to offer and Eleventy itself has a few tricks up its sleeve."
image: "eleventy-components.jpg"
imageAlt: "Child fiddling with electronic components - Photo by Kevin Jarrett on Unspash"
tags:
  - Front-end
  - 11ty
---

## Team Nunjucks

I personally use [Nunjucks](https://mozilla.github.io/nunjucks/) as my templating language with Eleventy. On top of being powerful and simple to learn, its syntax is similar to Twig, which I have been using for a while in [Craft](https://craftcms.com/) projects. That being said, [LiquidJS](https://liquidjs.com/) looks more fully-featured than the version of Liquid I used back in the days with Jekyll ... but I digress.

Back to my rule of thumb: when modularizing code, use all the tools offered by templating languages first. Only reach for custom filters and shortcodes when your use case requires it.

## Layouts

Among other things, I am quite fond of Nunjucks' [template inheritance](https://mozilla.github.io/nunjucks/templating.html#template-inheritance) concept. The combination of `extends` and `block` allows authors to chain multiple templates and to define blocks that extending templates can override or not. Nunjucks templates share the same scope or context, which means defined variables are available to other templates in that chain and can also be overridden.

As a rule of thumb, I use Nunjucks template inheritance for layouts and only use [Eleventy's layout system](https://www.11ty.dev/docs/layout-chaining/#addendum-about-existing-templating-features) when I need to specify a layout in a markdown file front matter. In that case, the called Nunjucks template has a `{% raw %}{{ content | safe }}{% endraw %}` tag where I want the content of my Markdown file to appear and Nunjucks takes over from then on.

## Filters

Most templating languages offer a bunch of [built-in filters](https://mozilla.github.io/nunjucks/templating.html#builtin-filters). When they are not quite up to snuff, Eleventy allows you to create [custom filters](https://www.11ty.dev/docs/filters/) using all the power of JavaScript and Node, as well as the ecosystem of packages, modules and libraries coming along with it.

Nunjucks has no filter to format dates? We can harness the power of [Luxon](https://moment.github.io/luxon/) and create one. How about localisation while we're at it?

```js
/**
 * Format a date with Luxon
 *
 * @param {String} date - string Date
 * @param {String} format - date format (Luxon)
 * @param {String} locale - locale
 * @returns {String} formatted date
 */

const { DateTime } = require("luxon");

module.exports = function (date, format, locale = "en") {
  date = new Date(date);
  return DateTime.fromJSDate(date).setLocale(locale).toFormat(format);
};
```

We can then make our filter available in Nunjucks, Liquid, Handlebars and JavaScript by adding it to `.eleventy.js`. Luxon is included in Eleventy but let's add it to our `package.json` for good measure: `npm i -D luxon`.

```js
module.exports = function(eleventyConfig) {
  // ... more config ...
  eleventyConfig.addFilter("formatDate", require("./src/_11ty/filters/formatDate.js"));
  // ... more config ...
};
```

Another type of filters I see myself creating regularly are the ones allowing me to filter collections. Let's say we need to display only posts belonging to certain categories in our templates.

```js
/**
 * Filter collection by categories
 *
 * @param {Array} collection - collection (assuming front-matter have a 'categories' key)
 * @param {Array} categories - array of categories (if string supplied, turn into array)
 * @returns {Array} collection items from specified categories
 */

module.exports = function (collection, categories) {
  let results = new Set();

  if (typeof categories === "string") {
    categories = Array.of(categories);
  }

  categories.forEach((cat) => {
    let matches = collection.filter((item) =>
      item.data["categories"].includes(cat)
    );
    matches.forEach((item) => results.add(item));
  });

  results = Array.from(results).sort((a, b) => a.date - b.date);

  return results;
};
```

Let's add the filter to our Eleventy configuration.

```js
module.exports = function (eleventyConfig) {
  // ... more config ...
  eleventyConfig.addFilter(
    "getByCategories",
    require("./src/_11ty/filters/getByCategories.js")
  );
  // ... more config ...
};
```

We can then use it like this in our templates:

```jinja2
{%- raw %}
{% set yummyPosts = collections.posts | getByCategories(["meals", "desserts"]) %}
{% endraw %}
```

## Includes

[Nunjucks includes](https://mozilla.github.io/nunjucks/templating.html#include) do not have a separate scope and do not take parameters. However, they can be nested and have access to variables defined in the template context.

My use cases for includes are static partials or the ones only needing access to variables available in the Nunjucks template context: header, footer, html `<head>`, navigation, pagination, etc.

Here is an include for a navigation interface that is itself included in a header.

```jinja2
{%- raw %}
{##
 # - get nav items from data file (./src/_data/mainnav.js)
 # - activeSection is set by Nunjucks and available in the template context
 # - if activeSection is equal to item.navTrigger, display active class and aria-current
 # - display navUrl, navLabel for each item
#}
<nav aria-label="main navigation">
  {% for item in nav %}

    {% set activeClass = "" %}
    {% set activeAria = "" %}
    {% if item.navTrigger == activeSection %}
      {% set activeClass = "is-active" %}
      {% set activeAria = 'aria-current="page"' %}
    {% endif %}

    {% if loop.first %}<ul class="c-mainnav">{% endif %}
      <li class="c-mainnav__item">
        <a class="c-mainnav__link  {{ activeClass }}" href="{{ item.navUrl }}" {{ activeAria }}>{{ item.navLabel }}</a>
      </li>
    {% if loop.last %}</ul>{% endif %}

  {% endfor %}
</nav>
{% endraw %}
```

## Nunjucks macros

[Macros](https://mozilla.github.io/nunjucks/templating.html#macro) are a bit more powerful and a bit more involved than includes. They have their own scope by default and can be passed positional or named parameters. They must also be imported using `{% raw %}{% from %}{% endraw %}` or `{% raw %}{% import %}{% endraw %}` before being used.

I use macros as soon as I need components with parameters and a small amount of logic. Their main advantage is their legibility when you need to output a non-trivial amount of HTML.

```jinja2
{%- raw %}
{% macro itemPost(title, date, url, featured) -%}

  {% set classes = "" %}
  {% if featured %}
    {% set classes = classes + " c-blogteaser--featured" %}
  {% endif %}

  <article class="c-blogteaser {{ classes }}">
    <p class="c-blogteaser__date"><time datetime="{{ date | formatDate('yyyy-MM-dd') }}">{{ date | formatDate("DDD") }}</time></p>
    <h2 class="c-blogteaser__title"><a class="c-blogteaser__link" href="{{ url }}">{{ title }}</a></h2>
  </article>

{% endmacro %}
{% endraw %}
```

Now we can import it and use it.

```jinja2
{%- raw %}
{% from "macros/itemPost.njk" import itemPost %}

{% set posts = collections.posts %}
{% for item in posts %}
  {% if loop.first %}<ul>{% endif %}
    <li>
      {{ itemPost(
        title = item.data.title,
        date = item.date,
        url = item.data.url,
        featured = item.data.featured
      ) }}
    </li>
  {% if loop.last %}</ul>{% endif %}
{% else %}
  <p>No post found</p>
{% endfor %}
{% endraw %}
```

A minor drawback of Nunjucks macros is that they need to be explicitly imported. In that regard, the [LiquidJS `render` tag](https://liquidjs.com/tags/render.html) appears to be a bit more flexible. Then again, we are explicitly importing components in "React and friends" all day long.

## Eleventy shortcodes

Eleventy shortcodes are essentially a way to create custom tags in various template languages, which makes them the most powerful option at our disposal to create components.

They can pretty much do everything Nunjucks macros can do and then some.

I reach for shortcodes when I need advanced logic, fine grained control over errors, NPM modules or async components fetching data or reading files. Paired shortcodes also help when there is a big block of content to process.

Like many, I will often reach for shortcodes to provide content authors with the ability to include snippets of HTML into Markdown files: styled Youtube embeds or figures with captions are common use cases.

Eleventy being its usual flexible self, most shortcodes can be made universal, which makes them available in all template languages that supports them (Nunjucks, Liquid, JavaScript, Handlebars).

In order to use them in Markdown files (you can use includes or macros that way too), set `markdownTemplateEngine` in your `.eleventy.js` config file to `njk`. That tells Eleventy to process markdown files with Nunjucks before rendering them to HTML.

Speaking of Nunjucks, here is a shortcode that will render the content of any markdown file in a template.

```js
/**
 * Returns rendered markdown from a file
 *
 * @param {String} path - Path of the file to render
 */

const fs = require("fs");
const path = require("path");
const markdownIt = require("markdown-it");
const md = new markdownIt();

module.exports = function (filePath) {
  filePath = path.resolve(filePath);

  if (path.extname(filePath) !== ".md") {
    throw new Error(`RenderMdFile expects Markdown files.`);
  }

  const fileContent = fs.readFileSync(filePath).toString();
  return md.render(fileContent);
};
```

Again, we have to declare the shortcode in our Eleventy configuration (you know the drill by now), before we can use it in our Nunjucks templates.

```jinja2
{%- raw %}
{% renderMdFile "src/content/markdown/test.md" %}
{% endraw %}
```

## Famous last words

I am personally really fond of the HTML first approach taken by Nunjucks and Eleventy for server-side rendered components.

However, it seems (server-side rendered first) JavaScript components are banging hard on the door of the SSG world lately. Projects like [eleventy-plugin-vue](https://www.netlify.com/blog/2020/09/18/eleventy-and-vue-a-match-made-to-power-netlify.com/), [Slinkity](https://slinkity.dev/) and [Astro](https://astro.build/) are all moving in this direction.

I have a feeling we might soon all write all-encompassing server-side rendered first, hydrated on demand components handling data, markup, styling and interactions.