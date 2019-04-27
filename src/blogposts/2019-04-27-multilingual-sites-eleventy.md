---
title: "Multilingual sites with Eleventy"
excerpt: "Eleventy might not have multilingual and localisation capabilities out of the box, but you can build a pretty good setup using global data files, collections and Nunjucks as a templating language."
image: "blahblahblah.jpg"
imageAlt: "Photo by Nick Fewings"
tags:
- Multilingual
- Localization
- Eleventy
- 11ty
---

In order to have a simple project to work with, let's build a fairly straight forward multilingual blog.

Here is the folder architecture we will be working with. It is quite a standard Eleventy architecture and a pretty simple project. However, I believe the principles and techniques can easily be applied to bigger ones.

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

The first step is to create our locales using [directory data files](https://www.11ty.io/docs/data-template-dir/).

We simply add `en.json` and `fr.json` in the root of our language directories. In each of them, we specify a `locale` key. That will make the cooresponding values accessible in all template files living in those languages directories and subdirectories.

Here what our `fr.json` file would contain:

```js
{
  "locale": "fr"
}
```

The values assigned to that `locale` key will be accessible in all our templates. `{{ locale }}` would now output "fr" or "en" for any of our template files.

Now that they are accessible to all our templates, we can pass those to our layouts and includes using Nunujucks and use them as keys to access values in `.json` or `.js` [global data files](https://www.11ty.io/docs/data-global/).

## Create localised date filter

Nunjucks does not have a date filter. We can easily create one using `moment.js` and pass it our `locale` value to localise dates for us, which is an important part of all multilingual projects. In order to do that, we use the following code in our `.eleventy.js` file:

```js
// date filter (localized)
eleventyConfig.addNunjucksFilter("date", function(date, format, locale) {
  locale = locale ? locale : "en";
  moment.locale(locale);
  return moment(date).format(format);
});
```

Now, we can just call that filter in our templatesand pass it a `locale` parameter. Note that, since we set the locale to "en" by default, we can use our filter without a locale parameter for our purely numeric dates. Here is a small example.

```twig
{% raw %}
<p><time datetime="{{ post.date | date('Y-MM-DD') }}">{{ post.item|date("DD MMMM Y", locale) }}</time></p>
{% endraw %}
```

Bingo, our dates are now automatically localized. Now, let's move to collections.

## Localized collections

We can also use our dirctory structure to create collections in Eleventy. The simplest way to go about it is to create collections per language. We can easily accomplish that using the [`getFilteredByGlob`](https://www.11ty.io/docs/collections/#getfilteredbyglob(-glob-)) method in our `.eleventy.js` file.

```js
module.exports = function(eleventyConfig) {
  eleventyConfig.addCollection("posts_en", function(collection) {
    return collection.getFilteredByGlob("./src/en/posts/*.md");
  });
};

module.exports = function(eleventyConfig) {
  eleventyConfig.addCollection("posts_fr", function(collection) {
    return collection.getFilteredByGlob("./src/fr/posts/*.md");
  });
};
```

Because they live in subdirectories of our language directories, all those markdown files have that handy `locale` variable available. We can for example use it to create permalinks for all our posts.

Instead of adding a `permalink` variable in each front-matter, we can simply add a `posts.js` or `posts.json` directory data file in each of our three `posts` folder with the following content:

```js
{% raw %}
{
  permalink: "/{{ locale }}/events/{{ page.fileslug }}/index.html"
}
{% endraw %}
```

Now that we have localised detail pages for all of our posts, we can simply go into all three of our `blog.njk` pages and loop over our language-specific collections.

```twig
{% raw %}
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

Note that we could make use of our `locale` variable to call our collections too. We would just have to switch to a square brackets notation instead.

```twig
{% raw %}
{% set posts = collections["posts_" + locale] %}
{% for post in posts %}
  {# loop content #}
{% endfor %}
{% endraw %}
```

## localised layouts and partials

Although duplicating our pages and posts is quite logical, we don't want to duplicate our layouts and partials.

Luckily, we can feed them localised strings. We only need to create multilingual global data files using our locales as keys. We can then reference those keys dynamically using our trusty `locale` variable.

Currently, that Eleventy `locale` variable is available automatically in our Nunjucks extended templates and included partials. We could just work with that, but I feel safer mapping it to a Nunjucks variable for good measure. I am sure that one will always be availble to includes and extends down the road.

### Layouts

Let's start with a simple layout example:

`./src/_data/site.js` is going to give us variables available under a `site` key.

```js
module.exports = {
  buildTime: new Date(),
  baseUrl: "https://www.mysite.com",
  name: "mySite",
  twitter: "@handle",
  en: {
    metaTitle: "Title in english",
    metaDescription: "Description in english"
  },
  fr: {
    metaTitle: "Titre en français",
    metaDescription: "Description en français"
  }
};
```

We can use those variables in our `./src/fr/pages/index.njk` page file. In this case, we assign some of them to Nunjucks variables instead of using them directly because those are values we want to be able to easily override for specific pages or for posts.

```twig
{% raw %}
---
permalink: /{{ locale }}/index.html
---

{% extends "layouts/base.njk" %}

{% set locale = locale %}
{% set metaTitle = site.fr.metaTitle %}
{% set metaDescription = site.fr.metaDescription %}
{% set metaImage = site.fr.metaImage %}

{% block content %}
  {# page content #}
{% endblock %}
{% endraw %}
```

Since our page file extends `./src/_includes/layouts/base.njk`, our Nunjucks variables declared in the child template as well as our Eleventy global variables are going to be available in that layout.

```twig
{% raw %}
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

Localizing partials like `./src/_includes/partials/footer.njk` follows the same principles.

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
    directionsLabel: "Itinéraire"
  },
  en: {
    addressTitle: "Address",
    addressStreet: "Market street",
    addressNumber: "42",
    addressPostcode: "1000",
    addressCity: "Brussels",
    directionsLabel: "Directions"
  }
};
```

Then, in `./src/_includes/partials/footer.njk`, we just rely on the value of our `locale` variable to access those keys using brackets notation:

```twig
{% raw %}
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

Just like that, we now have a footer with automatic translations. Since this file is a Nunjucks include, it has access to all variables defined in the template context, which means it has access to that `locale` variable we defined with our directory data files.

## Flexible by design

Static sites generators are usually flexible by design in terms of the data structures you can create with them. Eleventy is one of the most flexible SSG I have used so far, which makes it quite a good fit to create a multilingual data structure that can work for pretty much any project.
