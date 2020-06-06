---
title: "Language switcher for multilingual JAMstack sites"
excerpt: "Following my blogpost on multilingual websites with Eleventy, I had several questions about how to build a language switcher. Here is the approach I generally use."
image: "languages-choices.jpg"
imageAlt: "Roadsign with various choices - By Javier Allegue Barros"
tags:
  - Eleventy
  - 11ty
  - Jamstack
---

## Set the stage

With most static sites generators supporting a templating languages, structured data and URL control, building a multilingual website is a relatively easy task. I wrote a small [blogpost on how to do it with Eleventy](/blog/multilingual-sites-eleventy/). Other systems like Hugo and Jekyll have either [clear documentation](https://gohugo.io/content-management/multilingual/) or [numerous](https://www.sylvaindurand.org/making-jekyll-multilingual/) [articles](https://forestry.io/blog/creating-a-multilingual-blog-with-jekyll/) on the topic.

What we want here is to redirect users that are on a certain piece of content in one language to the same one in other languages. If such a piece of content is not available, we will redirect users to the homepage of the site in the language they chose.

We will be using Eleventy (11ty) but the general approach is usable with most other SSGs. Here is what we will need:

1. A way to loop through all languages used in the site
2. Make sure each piece of content has a `locale` key with its value set to the language code of that content. Here is a refresher about [how to do it with Eleventy directory data files](/blog/multilingual-sites-eleventy/) if you need one.
3. Set a common unique `translationKey` to create a relation between the same content in various languages

## Site languages

The first thing we need is an array of all the languages the site uses. I usually store that in my `./src/_data/site.js` file under a `languages` key.

```js
module.exports = {
  title: "Webstoemp",
  description:
    "Webstoemp is the portfolio and blog of Jérôme Coupé, a designer and front-end developer from Brussels, Belgium.",
  url: "https://www.webstoemp.com",
  baseUrl: "/",
  author: "Jerôme Coupé",
  authorTwitter: "@jeromecoupe",
  buildTime: new Date(),
  languages: [
    {
      label: "english",
      code: "en",
    },
    {
      label: "français",
      code: "fr",
    },
  ],
};
```

Using this array, we will be able to loop through our site languages and match the value of the `code` key against the value of the `locale` variable available in all our content files.

## Setup translation keys

We now need an explicit relation between the same pieces of content in various languages. With a static site generator storing data as files, we can rely on using the same translation key in the YAML front matters of all those files. That translation key can be any string, provided that it is unique for each piece of content.

For example, we could use the following to link together our contact pages in various languages.

`./src/en/pages/about.njk`

```twig
---
permalink: "{%raw%}/{{ locale }}/about/index.html{%endraw%}"
translationKey: "aboutPage"
---
```

`./src/fr/pages/about.njk`

```text
---
permalink: "{%raw%}/{{ locale }}/a-propos/index.html{%endraw%}"
translationKey: "aboutPage"
---
```

The same principle can apply to our collection items, for example blogposts.

`./src/en/bogposts/2019-09-12-my-awesome-blogpost.njk`

```text
---
title: "My awesome blogpost"
translationKey: "awesome-blogpost"
---
```

`./src/fr/bogposts/2019-09-12-mon-magnifique-blogpost.njk`

```text
---
title: "Mon magnifique blogpost"
translationKey: "awesome-blogpost"
---
```

We now have an explicit relation between the same content pieces in all languages.

## Coding our language switcher

Here is an outline of what we are going to do with that short piece of code:

1. Loop through all languages declared for the site in `./src/_data/site.js`
2. By default, set `translatedUrl` to the homepage of the language we are looping though. This will be overridden in step 4 if a match is found
3. Within our first loop, we will loop through all the content pieces in the site. With Eleventy, we can use the handy [`collections.all`](https://www.11ty.dev/docs/collections/#the-special-all-collection) shortcut.
4. For each content piece we loop through, check if its `translationKey` matches the current item's `translationKey` and if its `locale` matches the `code` of the language we are looping through in our first loop. If we find a match, set `translatedUrl` to the url of that content item.
5. Use the value of `translatedUrl` to create the links in our language switcher.

```twig
{%- raw -%}
{# loop though site.languages #}
{% for lgg in site.languages %}
  {% if loop.first %}<ul class="c-lggnav">{% endif %}

  {# set translatedUrl to the homepage of that language by default #}
  {% set translatedUrl = "/" + lgg.code + "/" %}

  {# set current language class #}
  {% set activeClass = "is-active" if lgg.code == locale else "" %}

  {# loop through all the content of the site #}
  {% for item in collections.all %}

    {# for each item in the loop, check if
    - its translationKey matches the current item translationKey
    - its locale matches the code of the language we are looping through #}
    {% if item.data.translationKey == translationKey and item.data.locale == lgg.code %}
      {% set translatedUrl = item.url %}
    {% endif %}

  {% endfor %}

  <li class="c-lggnav__item">
    <a class="c-lggnav__link  {{ activeClass }}" href="{{ translatedUrl }}">{{ lgg.label }}</a>
  </li>

  {% if loop.last %}</ul>{% endif %}
{% endfor %}
{%- endraw -%}
```

There we go, job done with a minimal amount of effort. Those loops will happen on every page of the site but, since Eleventy is already creating `collections.all` anyway and has very fast IO, the impact on build time should be pretty low, even with large sites.
