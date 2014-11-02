---
title: "Manipulating Craft's ElementCriteriaModel objects with Twig"
excerpt: "When working with Craft CMS, manipulating ElementCriteriaModel objects with Twig makes for leaner and meaner templates. Relatively complex functionalities can also be built pretty easily."
publication_year: 2014
categories:
- Craft
tags:
- ElementCriteriaModel
- Twig
---

## Introduction

While working on the templates of my latest [Craft CMS](http://buildwithcraft.com/) projects, I found myself manipulating [ElementCriteriaModel](http://buildwithcraft.com/docs/templating/elementcriteriamodel) objects with [Twig](http://twig.sensiolabs.org/) rather frequently. It is a very simple technique but one that is quite flexible and can be used in a wide variety of contexts to solve common problems.

Here are the basic steps:

1. Create an empty array.
2. Use `craft.entries.ids()` several times to get the IDs of the entries you need to display.
3. Use Twig's array filters [merge](http://twig.sensiolabs.org/doc/filters/merge.html) and [slice](http://twig.sensiolabs.org/doc/filters/slice.html) to assemble those arrays of ids into a single one using the array we created in step one.
4. Use `craft.entries.id(myCustomArray).fixedOrder(true).find()` to output exactly the entries you want using your newly created array of entry ids.

Let's go through a few use cases for that pattern.

## Complement user-selected entries with recent entries

This is a very common use case. On the homepage of a website, we let administrators choose six projects to highlight using an [entries field](http://buildwithcraft.com/docs/entries-fields). In the event they do not pick six of them, we want to complement that list with the most recent projects. We don't want any duplicates in that list.

Using the simple method described above, that's how we can implement this:

{% highlight jinja %}
{% raw %}
{#
 # 1. Create array containing Ids of chosen projects
 # 2. If not up to 6 items, get the Ids of the 6 most recent projects and remove chosen projects Ids from that list
 # 3. Get your final ElementCriteria model using your list of Ids
#}

{% set projectsIds = entry.homeProjects.ids() %}

{% if projectsIds | length < 6 %}
    {% set recentProjectsIds = craft.entries.section('projects').status('live').order('postDate desc').limit(6).ids() | without(projectsIds) %}
    {% set projectsIds = projectsIds | merge(recentProjectsIds) | slice(0,6) %}
{% endif %}

{% set projects = craft.entries.section('projects').status('live').id(projectsIds).fixedOrder(true).find() %}

{# you can now use 'projects' in a for loop for display #}
{% endraw %}
{% endhighlight %}

## Display related items on an entry pages

Here is another albeit similar scenario. On an entry page, we want to display 5 related entries. Related entries are specified manually by administrators using an entries field.

When no related entries have been found or when all slots are not used, we want to complement our list using entries sharing at least one category with the currently viewed entry. If that's still not enough entries to complete the list, we will just use the most recent articles.

Again, no duplicates allowed and the currently viewed entry should never appear in that list.

{% highlight jinja %}
{% raw %}
{#
 # 1. Create array containing Ids of related articles
 # 2. If not up to 5 items, get 6 entries sharing categories w/ the current entry
 # 3. If not up to 5 items, get the 6 most recent entries
 # 4. No duplicates allowed. Current entry should never appear in that list
#}
{% set articlesIds = entry.articleRelated.ids() %}

{% if articlesIds | length < 5 %}

  {% set currentCategories = entry.articleCategories %}

  {% if currentCategories | length %}
    {% set sameCategoryIds = craft.entries.section('articles').relatedTo(currentCategories).limit(6).ids() | without(articlesIds) | without(entry.id) %}
    {% set articlesIds = articlesIds | merge(sameCategoryIds) | slice(0,5) %}
  {% endif %}

{% endif %}

{% if articlesIds | length < 5 %}

  {% set recentIds = craft.entries.section('articles').limit(6).ids() | without(articlesIds) | without(entry.id) %}
  {% set articlesIds = articlesIds | merge(recentIds) | slice(0,5) %}

{% endif %}

{% set relatedNews = craft.entries.section('news').id(newsIds).fixedOrder(true).find() %}
{% endraw %}
{% endhighlight %}

## Order entries by categories

Another use case would be to display entries sorted by categories and reflect the order these have in our category group. An example that came up in a recent project: sponsors and levels of sponsorship.

We want to list the sponsor levels (categories) and preserve the order they have in the control panel. Then, we want to list all sponsors under each category. The client will be able to easily add a sponsor level and assign new sponsors to it. The client will also be able to reorder his sponsorship levels easily if needed.

{% highlight jinja %}
{% raw %}
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
{% endraw %}
{% endhighlight %}

There you go, three use cases for a simple but powerful technique. I hope you'll find this little trick useful when working on your next Craft project.