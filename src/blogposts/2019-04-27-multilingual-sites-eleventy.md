---
title: "Multilingual sites with Eleventy"
excerpt: "Eleventy might not have multilingual and localisation capabilities out of the box, but you can build a pretty good setup using global data files, collections and Nunjucks as a templating language."
image: "blahblahblah.jpg"
imageAlt: "Blah Blah Blah Neon sign - Photo by Nick Fewings"
tags:
  - Multilingual
  - Localization
  - Eleventy
  - 11ty
  - Jamstack
---

In order to have a basic project to work with, let's build a fairly straightforward multilingual blog.

Here is the folder architecture we will be working with. It is quite a standard [Eleventy](https://www.11ty.dev) architecture and a pretty straightforward project. However, I believe the principles and techniques can be applied to bigger ones.

```text
+-- src
  +-- _data
      +-- site.js
      +-- footer.js
      +-- header.js
  +-- _includes
      +-- layouts
          +-- base.njk
      +-- partials
          +-- header.njk
          +-- footer.njk
  +-- en
      +-- pages
          +-- index.html
          +-- blog.html
          +-- contact.html
      +-- posts
          +-- yyyy-mm-dd-some-blogpost.md
          +-- posts.json
      +-- en.json
  +-- fr
      +-- pages
          +-- index.html
          +-- blog.html
          +-- contact.html
      +-- posts
          +-- yyyy-mm-dd-some-blogpost.md
          +-- posts.json
      +-- fr.json
+-- .eleventy.js
```

## Set locales

The first step is to create our locales using [directory data files](https://www.11ty.dev/docs/data-template-dir/).

In order to do that, we add `en.json` and `fr.json` in the root of our language directories. In each of them, we specify a `locale` key. That will make the corresponding values accessible in all template files living in those languages directories and subdirectories.

Here what our `fr.json` file would contain:

```js
{
  "locale": "fr"
}
```

`{%- raw %}{{ locale }}{% endraw %}` will now output "fr" or "en" for any of our template files, depending on where that template file is located in our folder architecture.

## Localised date filter

Nunjucks does not have a date filter. We can create one using `moment.js` and pass it our `locale` value to localise dates for us, which is an important part of all multilingual projects. In order to do that, we use the following code in our `.eleventy.js` file:

```js
// date filter (localized)
eleventyConfig.addNunjucksFilter("date", function (date, format, locale) {
  locale = locale ? locale : "en";
  moment.locale(locale);
  return moment(date).format(format);
});
```

Now, we can call that filter in our templates and pass it a `locale` parameter. Note that, since we set the locale to "en" by default, we can use our filter without a `locale` parameter for our purely numeric dates. Here is a small example.

```twig
{%- raw  %}
<p><time datetime="{{ post.date | date('YYYY-MM-DD') }}">{{ post.item|date("DD MMMM YYYY", locale) }}</time></p>
{% endraw %}
```

Now that our dates are automatically localized, let's move to collections.

## Localized collections

We can also use our directory structure to create collections in Eleventy. The simplest way to go about it is to create collections per language. We can accomplish that using the [`getFilteredByGlob`](<https://www.11ty.dev/docs/collections/#getfilteredbyglob(-glob-)>) method in our `.eleventy.js` file.

```js
module.exports = function (eleventyConfig) {
  eleventyConfig.addCollection("posts_en", function (collection) {
    return collection.getFilteredByGlob("./src/en/posts/*.md");
  });
};

module.exports = function (eleventyConfig) {
  eleventyConfig.addCollection("posts_fr", function (collection) {
    return collection.getFilteredByGlob("./src/fr/posts/*.md");
  });
};
```

Because they live in subdirectories of our language directories, all those markdown files have that handy `locale` variable available. We can for example use it to create permalinks for all our posts.

Instead of adding a `permalink` variable in each front-matter, we can simply add a `posts.js` or `posts.json` directory data file in each of our three `posts` folders with the following content:

```js
{%- raw %}
{
  permalink: "/{{ locale }}/blog/{{ page.fileSlug }}/index.html"
}
{% endraw %}
```

Now that we have localised detail pages for all of our posts, we can go into all three of our `blog.njk` pages and loop over our language-specific collections.

```twig
{%- raw %}
{% for post in collections.posts_en | reverse %}
  {% if loop.first %}<ul>{% endif %}
    <li>

      <article>
        <p><time datetime="{{ post.date | date('Y-MM-DD') }}">{{ post.date | date("DD MMMM[,] Y", locale) }}</time></p>
        <h3><a href="{{ post.url }}">{{ post.data.title }}</a></h3>
      </article>

    </li>

  {% if loop.last %}</ul>{% endif %}
{% endfor %}
{% endraw %}
```

We could make use of our `locale` variable to call our collections too. We would just have to switch to a square brackets notation instead.

```twig
{%- raw %}
{% set posts = collections["posts_" + locale] %}
{% for post in posts %}
  {# loop content #}
{% endfor %}
{% endraw %}
```

## Localised layouts and partials

Although duplicating our pages and posts is quite logical, we don't want to duplicate our layouts and partials.

Luckily, we can avoid it by feeding them localised strings. In order to do that, we need to create multilingual [global data files](https://www.11ty.dev/docs/data-global/) containing our locales as keys. We can then reference those keys dynamically in our layouts or partials using our trusty `locale` variable.

### Layouts

Let's start with a layout example:

`./src/_data/site.js` is going to give us variables available under a `site` key.

```js
module.exports = {
  buildTime: new Date(),
  baseUrl: "https://www.mysite.com",
  name: "mySite",
  twitter: "@handle",
  en: {
    metaTitle: "Title in english",
    metaDescription: "Description in english",
  },
  fr: {
    metaTitle: "Titre en français",
    metaDescription: "Description en français",
  },
};
```

We can use those variables in our `./src/fr/pages/index.njk` file. In this case, we assign some of them to Nunjucks variables instead of using them directly because those are values we might want to override for specific pages. We could use the same logic for a posts specific template.

```twig
{%- raw %}
---
permalink: /{{ locale }}/index.html
---

{% extends "layouts/base.njk" %}

{% set metaTitle = site[locale].metaTitle %}
{% set metaDescription = site[locale].metaDescription %}
{% set metaImage = site[locale].metaImage %}

{% block content %}
  {# page content #}
{% endblock %}
{%- endraw %}
```

Since our page template extends `./src/_includes/layouts/base.njk`, Nunjucks variables declared in the child template as well as our Eleventy global variables are going to be available in that layout too.

```twig
{%- raw %}
<!DOCTYPE html>
<html lang="{{ locale }}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="ie=edge">
  <title>{{ metaTitle }}</title>
  <link rel="stylesheet" href="/css/main.min.css">

  <!-- open graph -->
  <meta property="og:type" content="article">
  <meta property="og:title" content="{{ metaTitle }}">
  <meta property="og:image" content="{{ metaImage }}">
  <meta property="og:site_name" content="{{ site.name }}">
  <meta property="og:description" content="{{ metaDescription }}">

  <!-- twitter -->
  <meta name="twitter:card" content="summary">
  <meta name="twitter:site" content="{{ site.twitter }}">
  <meta name="twitter:title" content="{{ metaTitle }}">
  <meta name="twitter:description" content="{{ metaDescription }}">
  <meta name="twitter:image" content="{{ metaImage }}">
</head>
<body>
  {% include "partials/siteheader.njk" %}
  {% block content %}{% endblock %}
  {% include "partials/sitefooter.njk" %}
</body>
</html>
{% endraw %}
```

### Partials

Localizing partials like `./src/_includes/partials/footer.njk` can be done using the same principles.

First, we create a `./data/footer.js` file using our locales as keys.

```js
module.exports = {
  mapUrl: "https://goo.gl/maps/3YTkhCgfEgj1PRAd7",
  fr: {
    addressTitle: "Adresse",
    addressStreet: "Rue du marché",
    addressNumber: "42",
    addressPostcode: "1000",
    addressCity: "Bruxelles",
    directionsLabel: "Itinéraire",
  },
  en: {
    addressTitle: "Address",
    addressStreet: "Market street",
    addressNumber: "42",
    addressPostcode: "1000",
    addressCity: "Brussels",
    directionsLabel: "Directions",
  },
};
```

Then, in `./src/_includes/partials/footer.njk`, we just rely on the value of our `locale` variable to access those keys using brackets notation:

```twig
{%- raw  %}
<footer>
  <h2>{{ footer[locale].addressTitle }}</h2>
  <p>
    {{ footer[locale].addressStreet }}, {{ footer[locale].addressNumber }}<br>
    {{ footer[locale].addressPostcode }}, {{ footer[locale].addressCity }}
  </p>
  <p><a href="{{ footer.mapUrl }}">{{ footer[locale].directionsLabel }}</a></p>
</footer>
{% endraw %}
```

Hurrah! We now have a footer with automatic translations.

## Language switcher

If you need to build a language switcher, [here is a straightforward approach](/blog/language-switcher-multilingual-jamstack-sites/) using this setup.

## Flexible by design

Static sites generators are very flexible in terms of the data structures you can create with them. Eleventy is one of the most flexible SSG I have used so far, which makes it quite a good fit to create a multilingual data structure that can work for pretty much any project.
