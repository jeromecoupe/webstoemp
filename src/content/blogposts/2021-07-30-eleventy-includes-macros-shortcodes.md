---
title: "Nunjucks includes and macros or Eleventy shortcodes?"
excerpt: "When working with Eleventy and Nunjucks, we have three main choices to modularize our code: Nunjucks includes and macros or Eleventy shortcodes. Here are a few pointers I use to choose the right tool for the job at hand."
image: "construction.jpg"
imageAlt: ""
tags:
  - Front-end
  - Eleventy
  - 11ty
draft: true
---

## Team Nunjucks

Although Eleventy allows you to work with many template languages, I confess being a bit of a Nunjucks fanboy. While remaining quite simple to learn and use, it is also very powerful. Of course, if you favor other templating languages, you might not find yourself in the exact same conundrum.

I am particularly fond of the concept of template inheritance. The combination of `extends` and `blocks` allows authors to chain multiple templates and to define blocks that extending templates can override.

By default, extended and extending Nunjucks templates share the same scope or context, which means that defined variables are available to other templates in that chain and can also be overridden.

## Nunjucks includes

Includes do not have a separate scope and do not take parameters. However, they can be nested and have access to the global template context. Any variable available to their parent template can be accessed or overridden.

Includes are Nunjucks' basic tool to modularize your code, allowing you to reuse code throughout a project.

My use cases for includes are static components or simple ones only needing access to the global template context: header, footer, html `<head>`, navigation, pagination, repeated blocks in for loops, etc.

Includes can be used in your Markdown files. Provided that you set `markdownTemplateEngine` in your `.eleventy.js` config file to `njk`, Eleventy will process your markdown files with Nunjucks before rendering them to HTML.

Here is an example with the main navigation for this very website:

```jinja2
{%- raw %}
{#
- get nav items from data file (./src/_data/nav.js)
- if activeSection is equal to navTrigger, display an active class (activeSection is set through templates)
- display navTrigger, navUrl, navLabel for each item
#}

{% set currentClass = "" %}
{% set currentAria = "" %}
{% if activeSection == item.navTrigger %}
  {% set currentClass = "isActive" %}
  {% set currentAria = 'aria-current="page"' %}
{% endif %}

<nav class="c-siteheader__nav" aria-label="header navigation">
  {% for item in nav %}
    {% if loop.first %}<ul class="c-mainnav">{% endif %}
      <li class="c-mainnav__item">
      <a href="{{ item.navUrl }}" class="c-mainnav__link {{ currentClass }}" {{ currentAria }}>{{ item.navLabel }}</a>
      </li>
    {% if loop.last %}</ul>{% endif %}
  {% endfor %}
  <p class="c-mainnav-compact"><a class="js-navtrigger" href="#footernav">{% include "svg/icon-hamburger.svg" %}</a></p>
</nav>
{% endraw %}
```

## Nunjucks macros

Macros are a bit more powerful and a bit more involved as well. They have a separate scope and can be passed positional or named parameters. They must also be imported using `{% raw %}{% from %}{% endraw %}` or `{% raw %}{% import %}{% endraw %}` (for namespaced macros) before being used.

I use macros when I need components or utilities with scoped parameters.

Like includes, macros can be used in Markdown files, given the same configuration option.

Example: dates utilities

## Eleventy shortcodes

Eleventy shortcodes are essentially a way to create custom tags in various template languages, which makes them the most powerful option at our disposal to create components.

Being written in JavaScript / Node, they have access to the advanced logic capabilities of JS / Node and to that ecosystem of modules and libraries. Depending on your template language of choice, they can also run asynchronously, which can prove really useful in some contexts where you need to fetch some data.

Eleventy being its usual flexible self, non async shortcodes can be universal, which will make them available in all supported template languages.

I generally use shortcodes for components that require advanced logic or capabilities, make use of NPM modules or have to work async. Paired shortcodes in Eleventy also make them very useful if you have a block of content to process.

Example: