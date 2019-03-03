---
title: "Tips for Craft multilingual websites"
excerpt: "I live and work in Belgium, a country with three official languages. Multilingual websites are quite a common sight around here. Here is what I learned along the way after building a few of those using Craft as a CMS."
image: "flags.jpg"
imageAlt: "Flags - Photo by Joshua Fuller"
tags:
- CMS
- Craft
- Twig
---

As I already said [elsewhere](/blog/why-craft-cms/), Craft's multilingual support is second to none and having localisation built into the core is just great. That being said, there are a few gotchas, tips and tricks I'd like to document for myself and share with you.

## Setting Craft up

[Pixel&amp;Tonic](http://pixelandtonic.com/) did a great job of describing the basic steps involved in [setting up a multilingual or localised website using Craft](http://buildwithcraft.com/docs/localization-guide). If you haven't read that guide yet, please do and come back afterwards.

## A few config helpers

I personally like to add a few variables to my [general.php config file](http://buildwithcraft.com/docs/multi-environment-configs) when I am done with the basic multilingual setup.

Since I am usually sharing files between locales (css, images), I like to add a `rootUrl` variable that I can use in my template with `{% raw %}{{ craft.config.rootUrl }}{% endraw %}`. I could also count on the `baseUrl` environmentVariable that I use for asset sources and write `{% raw %}{{ craft.config.environmentVariables['baseUrl'] }}{% endraw %}` but that's a lot longer to type.

I also like to have a `currentLgg` array with just the language codes in general.php. I use those for my `lang` attributes in my `<html>` tag for example.

The locales used by Craft and the [language codes the W3C wants you to use](http://www.w3.org/TR/html401/struct/dirlang.html#h-8.1.1) are different. Among other things, the W3C wants you to use hyphens and not underscores. Adding a custom variable to your general.php file is an easy way to map your locales to those codes. Personally, I usually map my locales to two letter codes: "en_us" is mapped to "en", "fr_be" is mapped to "fr", etc.

You can then use those variables in your templates like this `{% raw %}<html lang="{{ craft.config.currentLgg[craft.locale] }}">{% endraw %}`

Here is an example of a general.php config file with three locales:

```php
return array(

  '*' => array(
    'omitScriptNameInUrls' => true,
    'cpTrigger' => 'admin'
  ),

  // dev
  '.dev' => array(
    'devMode' => true,
    'siteUrl' => array(
        'fr_be' => 'http://mywebsite.dev/',
        'en'    => 'http://mywebsite.dev/en/',
        'nl'    => 'http://mywebsite.dev/nl/'
    ),
    'rootUrl' => 'http://mywebsite.dev/',
    'currentLgg' => array(
        'fr_be' => 'fr',
        'en'    => 'en',
        'nl'    => 'nl'
    ),
    'environmentVariables' => array(
        'baseUrl'       => 'http://mywebsite.dev/',
        'basePath'      => '/path/to/public/'
    )
  ),

  // production
  '.com' => array(
    'siteUrl' => array(
        'fr_be' => 'http://mywebsite.com/',
        'en'    => 'http://mywebsite.com/en/',
        'nl'    => 'http://mywebsite.com/nl/'
    ),
    'currentLgg' => array(
        'fr_be' => 'fr',
        'en'    => 'en',
        'nl'    => 'nl'
    ),
    'rootUrl' => 'http://mywebsite.com/',
    'environmentVariables' => array(
        'baseUrl'       => 'http://mywebsite.com/',
        'basePath'      => '/path/to/public/'
    )
  )
);
```

## Twig macros are awesome

There are a few things in multilingual websites where [the awesomeness called Twig macros](http://twig.sensiolabs.org/doc/tags/macro.html) can help a great deal. Dates are a prime example. Craft and Yii already do a great job of localising days and month names, but you might also need a different format depending on your current locale.

For the english version, a date might be "April 1, 2015" where in french it would need to be "1 avril 2015". The order is different and there is a coma in English that's not there in the French version.

We can easily create a macro that outputs localised dates from a date object. We are simply going to use the `currentLgg` variable we created earlier.

```twig
{% raw %}{% macro localizeDate(date) %}
  {% if craft.config.currentLgg[craft.locale] == 'fr' %}
    {{ date|date('j F Y') }}
  {% else %}
    {{ date|date('F j, Y') }}
  {% endif %}
{% endmacro %}{% endraw %}
```

After importing the macro in our template, we can use it like this:

```twig
{% raw %}<p class="text-meta"><time datetime="{{ item.postDate|date('Y-m-d') }}">{{ siteMacros.localizeDate(item.postDate) }}</time>{% endraw %}
```

The same principles can be applied to a wide variety of use cases and simplify your life as a Craft developer working on a multilingual project.

## A simple language switcher

Sometimes, the client just wants a link to the homepage if a user chooses another language. That being said, provided every page of your site is an entry of some kind, creating a dynamic language switcher is relatively straightforward.

A word on building Craft sites with entries. When building a multilingual website with Craft, it will make your life easier if all your pages are an entry of some kind. A blog detail page would be an entry in a Channel, whereas the blog list page would be a Single. In my opinion, that's the best way to make the most use of Craft's localisation features, make your content providers comfortable and have different URLs / slugs for each language.

Back to our language switcher. If an entry in another locale exists, we want to link to that entry. If we cannot find an entry in a given locale, we will simply redirect the user to the homepage in the chosen locale.

Here is an example of the code I use. I've added comments so that it is documented.

```twig
{% raw %}{# loop through all site locales #}
{% for locale in craft.i18n.getSiteLocales() %}
  {% if loop.first %}<ul class="lggnav">{% endif %}

  {# is the locale the current one ? #}
  {% set current = (craft.locale == locale.id) ? '  lggnav__item--current' : '' %}

  {# get entry in other locales #}
  {% set localisedEntry = craft.entries.id(entry.id).locale(locale.id).first() %}

  {# check if entry is found (takes care of disabled entries or entries in sections not set to use specific locales) #}
  {% if localisedEntry %}

    {# if entry is found display link #}
    {% set linkUrl = localisedEntry.getUrl() %}

  {% else %}

    {# if no entry is found, link to homepage #}
    {% set linkUrl = craft.config.siteUrl[locale.id] %}

  {% endif %}

  <li class="lggnav__item{{ current }}"><a href="{{ linkUrl }}">{{ craft.config.currentLgg[locale.id]|upper }}</a></li>

  {% if loop.last %}</ul>{% endif %}
{% endfor %}{% endraw %}
```

This simple language switcher does not take categories into account. When on the blog list page with a category selected, the user would be redirected to that blog list page without any selected categories upon switching language.

That is an acceptable trade-off I'll happily make to keep my template logic simple. I also feel it is a good way to take care of cases where categories might not be available in all languages, for example if no entry is attached to a category in a specific locale.

These are the simple tools I have used to build a few multilingual websites. I cannot say enough how much Craft and Twig have made my life easier on those projects.

Hit me up on [Twitter](https://twitter.com/jeromecoupe) or on Craft Slack if you have a few tips and tricks of your own. I'd love to hear about them.
