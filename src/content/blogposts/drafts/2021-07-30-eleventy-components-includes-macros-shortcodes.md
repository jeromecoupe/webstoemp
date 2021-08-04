---
title: "Components with Eleventy: use cases for includes, macros and shortcodes"
excerpt: "When working with Eleventy and Nunjucks, we have three main choices to create modularize our code: Nunjucks includes and macros or Eleventy shortcodes. Here are some pointers I use to choose the right tool for the job."
image: "eleventy-components.jpg"
imageAlt: "Child fiddling with electronic components - Photo by Kevin Jarrett on Unspash"
tags:
  - Front-end
  - 11ty
---

## Team Nunjucks

Although Eleventy allows you to work with several template languages, I confess leaning towards Nunjucks. While remaining quite simple to learn and use, it is also very powerful. It is also similar to Twig, which I have used for a while in Craft projects.

I particularly like the concept of template inheritance. The combination of `extends` and `blocks` allows authors to chain multiple templates and to define blocks that extending templates can override. Extended and extending Nunjucks templates share the same scope or context, which means that defined variables are available to other templates in that chain and can also be overridden.

## Nunjucks includes

Includes are the first and most basic tool available to modularize our code.

Nunjucks includes do not have a separate scope and do not take parameters. However, they can be nested and have access to variables defined in the template context.

Includes can be used in Markdown files, provided that we set `markdownTemplateEngine` in our `.eleventy.js` config file to `njk`, Eleventy will process our markdown files with Nunjucks before rendering them to HTML.

My use cases for includes are static components or simple ones only needing access to variables available in the Nunjucks template context: header, footer, html `<head>`, navigation, pagination, repeated blocks in for loops, etc.

Here is an example used for a main navigation interface:

```jinja2
{%- raw %}
{##
 # - get nav items from data file (./src/_data/mainnav.js)
 # - activeSection set by Nunjucks and available in the template context
 # - if activeSection is equal to item.navTrigger, display active class and aria-current
 # - display navUrl, navLabel for each item
#}
<nav class="c-siteheader__nav" aria-label="main navigation">
  {% for item in nav %}
    {% if loop.first %}<ul class="c-mainnav">{% endif %}
      <li class="c-mainnav__item">
        <a class="c-mainnav__link  {{ 'is-active' if activeSection == item.navTrigger }}" href="{{ item.navUrl }}" {% if activeSection == item.navTrigger %}aria-current="page"{% endif %}>{{ item.navLabel }}</a>
      </li>
    {% if loop.last %}</ul>{% endif %}
  {% endfor %}
</nav>
{% endraw %}
```

## Nunjucks macros

Macros are a bit more powerful and a bit more involved than includes. They are scoped by default and can be passed positional or named parameters. They must also be imported using `{% raw %}{% from %}{% endraw %}` or `{% raw %}{% import %}{% endraw %}` before being used.

I use macros as soon as I need components or utilities with parameters or a reasonable amount of logic. Like includes, macros can be used in Markdown files, provided that we set `markdownTemplateEngine` in our `.eleventy.js` config file to `njk`, Eleventy will process our markdown files with Nunjucks before rendering them to HTML.

Like includes, macros can be used in Markdown files, using the same `markdownTemplateEngine` configuration setting.

Here is a macro outputting a localized HTML `<time>` element using a `formatDate` filter based on Luxon.

```jinja2
{%- raw %}
{% macro htmlDate(date, locale="en") -%}
  <time datetime="{{- date | formatDate('yyyy-MM-dd', locale) -}}">{{- date | formatDate("DDD", locale) -}}</time>
{%- endmacro %}
{% endraw %}
```

Macros need to be imported in any template using them.

```jinja2
{%- raw %}
{% from "macros/dates.njk" import htmlDate %}

{{ htmlDate("2021-08-02") }}
{% endraw %}
```

If you need to pass a lot of content as one parameter of the macro, you can use [the `call` tag](https://mozilla.github.io/nunjucks/templating.html#call) with your macros.

## Eleventy shortcodes

Eleventy shortcodes are essentially a way to create custom tags in various template languages, which makes them the most powerful option at our disposal to create components. They can pretty much do everything Nunjucks macros can do, and then some. Because shortcodes usually return JavaScript template literals, they tend to look less readable to me than macros when you have a lot of HTML.

Here is our `htmlDate` macro as a shortcode using the same Luxon based filter:

```js
const formatDate = require("../filters/formatDate.js");

module.exports = function (date, locale = "en") {
  const jsDate = new Date(date);
  const dateIso = formatDate(jsDate, "yyyy-MM-dd", locale);
  const dateDisplay = formatDate(jsDate, "DDD", locale);
  return `<time datetime="${dateIso}">${dateDisplay}</time>`;
};
```

Being written in JavaScript / Node, they have access to advanced logic and capabilities as well as to a huge ecosystem of modules and libraries. Depending on your template language of choice, they can run asynchronously, which can prove really useful in contexts where you need to fetch data or read files. Consider paired shortcodes if you have a block of content to process.

Eleventy being its usual flexible self, most shortcodes can be made universal, which makes them available in all template languages that supports them (Nunjucks, Liquid, JavaScript, Handlebars).

## Last words

While I think includes are suitable for simple components, the choice between using Nunjucks macros and Eleventy shortcodes is trickier to make for more advanced ones.

Right now, I mainly use macros and only resort to shortcodes when my use case calls for something more powerful (NPM packages, advanced logic, async etc.). In the same vein, I default to using Nunjucks filters and supplement them with Eleventy filters when needed.
