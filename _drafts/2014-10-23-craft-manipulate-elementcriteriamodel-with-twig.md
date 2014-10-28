---
title: "Manipulate Craft ElementCriteriaModel with Twig"
excerpt: "When working with Craft CMS, manipulating ElementCriteriaModel with Twig CMS makes for leaner and meaner templates. It also allows me to create relatively complex functionalities pretty easily."
publication_year: 2014
categories:
- Craft
tags:
- ElementCriteriaModel
- Twig
---

## Introduction

When working on the templates of the latest websites I developed with [Craft CMS](@TODO), I found myself manipulating [ElementCriteriaModels](@TODO) with [Twig](@TODO). This has become a pattern for me. It saved me a lot of time and effort and it made my templates easier to read.

It is a very simple technique but one that is quite flexible and can be used in a wide variety of context to solve problems or meet feature requests. Here are the basic steps:

1. Create an empty array.
2. Use `craft.entries.ids()` one several times to get the IDs of the entries you need to display.
3. Use Twig's array manipulation functions (@TODO) to assemble those arrays of ids into a single one. Use the empty array you created in step one.
4. Use `craft.entries.id(myCustomArray).fixedOrder(true).find()` to output exactly the entries you want using your newly created array of entries.

## Examples

Let's go through a few use cases for that technique:

### Complement user-selected entries with latest entries

This is a very commn use case. On the homepage of a website, you let administrators choose fsix projects to highlight using an [entries field](@TODO). In the event they do not choose six of them, you want to complement that list with the most recent projects to fill in your six slots. Of course you don't want duplicates in that list.

Using our simple method described above, that's how you would implement it.

```twig
{# Selected projects complemented by recent ones
 # ---------------------------------------------
 # - Get chosen projects ids (homepage entries field)
 # - Get most recent 6 projects ids and remove chosen projects ids from array
 # - Merge both arrays and limit array to 6 items
 # - pass the 6 ids list to a craft.entries call to get the projects to display
#}

{% set chosenProjectsIds = entry.homeProjects.ids() %}
{% set projectsIds = chosenProjectsIds %}

{% if projectsIds | length < 6 %}
    {% set recentProjectsIds = craft.entries.section('projects').status('live').order('postDate desc').limit(6).ids() | without(chosenProjectsIds) %}
    {% set projectsIds = chosenProjectsIds | merge(recentProjectsIds) | slice(0,6) %}
{% endif %}

{% set projects = craft.entries.section('projects').status('live').id(projectsIds).fixedOrder(true).find() %}

{# you can now use 'projects' in a for loop for display #}
```

### Complement a list of related entries with latest entries

Here is another, albeit similar scenario. On an enry page, you want to show up to 4 related entries. Related entries are specified manually by administrators. When no related entries have been found or when all four slots are not used, you want to complement your list using entries in the same category than the entry you are viewing. If not enough are found in the same category, just complete your four slots with the most recent articles. Again, no duplication allowed.

```
{% set articlesIds = [] %}
{% set articlesIds = entry.articleRelated.ids() %}
{% if articlesIds | length < 4 %}
  {% set currentCategory = entry.articleCategory.first() %}
  {% set sameCategoryIds = craft.entries.section('articles').status('live').order('postDate desc').relatedTo(currentCategory).limit(4).ids() | without(articlesIds) %}
  {% set articlesIds = articlesIds | merge(sameCategoryIds) | slice(0,4) %}
  {% if articlesIds | length < 4 %}
    {% set recentIds = craft.entries.section('articles').status('live').order('postDate desc').limit(4).ids() | without(articlesIds) %}
    {% set articlesIds = articlesIds | merge(recentIds) | slice(0,4) %}
  {% endif %}
{% endif %}

```

### Order entries by categories and preserve order of categories

My last use case would be to display entries sorted by categories, while reflecting the order categories have in your category group. One recent example of that was sponsors and levels of sponsorship.

In our module, we want to list the categories in the order they are in in the control panel and then list all sponsors under each categories. That way, the client can easily add a sponsor level category and add new sponsors to it. The client will also be able to reorder his sponsorship level easily.

This one could be simplified by not using Ids and saving a database call but I've decided to leave it as is to show that the same technique is used here as well.

```
{#
 # Sponsors listed by categories
 # -----------------------------
 # - Create an empty array to hold our entries ids
 # - Get the list of categories in the order they are in in the CP
 # - For each category, get a list of entry ids related to that category
 # - Merge each of those arrays with the "sponsors" array
##}
{% set sponsors = [] %}
{% set sponsorsCategories = craft.categories.group('sponsorLevels').find() %}
{% for category in sponsorsCategories %}
  {% set categorySponsors = craft.entries.section('sponsors').relatedTo(category).ids() %}
  {% set sponsorsIds = sponsors | merge(categorySponsors) %}
{% endfor %}

{% set sponsors = craft.entries.section('sponsors').status('live').id(sponsorsIds).fixedOrder(true).find() %}

{# you can now use 'sponsors' in a for loop for display #}
```

There you go. That's three use cases for a technique I have been using on several projects recently. It has allowed me to create seemingly complex functionalities with a really simple and flexible technique.

Next time you are confronted with a complex request, add this to your arsenal of possible techniques.