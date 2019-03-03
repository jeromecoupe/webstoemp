---
title: "Combined searches and filters using Craft"
excerpt: "In a recent project, I had to create combined searches and filters with Craft CMS. The basic gist of it consists in using Twig to build modular objects that can then be consumed by Craft in the form of query parameters."
image: "mixer.jpg"
imageAlt: "Audio mixer - Photo by chuttersnap"
tags:
- Craft
- Filters
- Search
---

[As already mentioned in another post](/blog/manipulating-craft-elementcriteriamodel-with-twig/), Twig's ability to handle and manipulate data in the form of objects, combined with Craft's `ElementCriteriaModel` allows us to build complex queries. Searches and filters are just another application of the same principles.

Let's get coding.

## Setting the stage

We start with a classic paginated list of blogposts. Our hypothetical client wants us to create a series of filters (year of publication, blogpost type category, blogpost topic category) and a search box that should allow users to filter blogposts on the list page.

Here is the twist: those filters and the search should allow the users to perform cumulative searches and filtering. For example, users should be able to only display the posts published in 2015 *and* belonging to the "geek stuff" theme *and* belonging to the "cms" topic *and* containing the word "Brad" in their titles.

Of course, the list should remain properly paginated whatever the query.

## Building the form

The first step is to build the form. Here are the four pieces we need:

1. a dropdown of all the years during which at least one entry was published
2. a dropdown of all the blogpost themes containing at least one entry
3. a dropdown of all the blogpost topics containing at least one entry
4. a search field to allow for free text search on entries' titles

Our form will generate four parameters in a query string: `year`, `theme`, `topic` and `q`. We will then be able to use those parameters to build our Craft query.

```twig
{% raw %}<form action="{{ url('blog/') }}" method="get">

  {# years
  - get first entry ever and grab year
  - get last entry ever and grab year
  - loop from first to last year values
  - check that at least one entry can be found in the year before displaying it
  #}
  {% set firstEntry = craft.entries.section('blog').order('postDate desc').first() %}
  {% set lastEntry = craft.entries.section('blog').order('postDate desc').last() %}
  {% set firstEntryYear = firstEntry.postDate|date('Y') %}
  {% set lastEntryYear = lastEntry.postDate|date('Y') %}
  {% for year in firstEntryYear .. lastEntryYear %}
    {% if loop.first %}<select name="year">{% endif %}
    {% if loop.first %}<option value="">Choose a year</option>{% endif %}

      {# check at least one project can be found in the current year #}
      {% set postInYear = craft.entries.section('blog').after(year).before(year + 1).first() %}
      {% if postInYear %}

        {# if already a 'year' parameter in the URL, select the corresponding year #}
        {% set searchYear = craft.request.getParam('year') %}
        {% set yearActive = (searchYear == year) ? 'selected' : '' %}
        <option value="{{ year }}" {{ yearActive }}>{{ year }}</option>

      {% endif %}
    {% if loop.last %}</select>{% endif %}
  {% endfor %}

  {# get all entries to display only the categories related to entries #}
  {% set blogAllEntries = craft.entries.section('blog').limit(null).find() %}

  {# themes categories #}
  {% set blogThemes = craft.categories.group('themes').relatedTo(blogAllEntries).find() %}
  {% for category in blogThemes %}
    {% if loop.first %}<select name="theme">{% endif %}
      {% if loop.first %}<option value="">Choose a theme</option>{% endif %}

      {# if already a 'theme' parameter in the URL, select the corresponding theme category in the dropdown #}
      {% set themeCategory = craft.request.getParam('theme') %}
      {% set themeActive = (themeCategory == category.slug) ? 'selected' : '' %}
      <option value="{{ category.slug }}" {{ themeActive }}>{{ category.title }}</option>

    {% if loop.last %}</select>{% endif %}
  {% endfor %}

  {# topics categories #}
  {% set blogTopics = craft.categories.group('topics').relatedTo(blogAllEntries).find() %}
  {% for category in blogTopics %}
    {% if loop.first %}<select name="topic">{% endif %}
      {% if loop.first %}<option value="">Choose a topic</option>{% endif %}

      {# if already a 'topics' parameter in the URL, select the corresponding topic category in the dropdown #}
      {% set topicCategory = craft.request.getParam('topic') %}
      {% set topicActive = (topicCategory == category.slug) ? 'selected' : '' %}
      <option value="{{ category.slug }}" {{ topicActive }}>{{ category.title }}</option>

    {% if loop.last %}</select>{% endif %}
  {% endfor %}

  {# search field #}
  <input type="search" name="q">
  <input type="submit" value="search">

</form>{% endraw %}
```

When that form gets submitted, we now have a query string at the end of our URL that has the following format:  `/blog?year=&theme=&topic=&q=`.

These parameters might not be the prettiest in our URLs but at least users are able to bookmark searches and are not asked to resend data when they reload a page. This method would work with POST data, but the pagination part will be harder to pull off. Sure, you can resort to AJAX for it, at which point a full-blown JSON / [Vue.js](http://vuejs.org) solution is likely a better option.

## Retrieving form data and building modular queries

The next step is to use `craft.request` to grab those parameters from the URL and use these to create our custom modular query. To build it, we will make use of the fact that the `craft.entries` tag can be fed an object. As it happens, Twig can handle objects and arrays and manipulate them using primarily the `merge` filter.

Here is the plan for this step:

1. Instantiate an object with the default query parameters we need: `section`, `order` `limit`, etc.
2. Check if the `year` parameter has a value and use `before` and `after` to build the time-based part of our query. Add it to our object
3. Check if a `theme` and/or `topic` parameter have a value and use `relatedTo` to build the category part of our query. Add it to our object
4. Check if a `q` parameter has a value and use `search` to build the text search part of our query. Add it to our object

When this is ready, we will have a modular query object with various parameters and values depending on the user input. We can then feed that object to `craft.entries` and retrieve what we need from the database.

```twig
{% raw %}{# build our query object
- Default parameters
- If a year has been chosen: add 'before' and 'after' parameters to the query
- If one or more categories have been chosen: build an empty array and use it to build a 'relatedTo' parameter that we can add to the query
- If a category has been chosen: add 'relatedTo' parameter to the query
- If a search term has been entered: add 'search' parameter to the query
#}

{# defaults #}
{% set queryParams = {
  section: 'blog',
  order: 'postDate desc',
  limit: 2,
} %}

{# year #}
{% set searchYear = craft.request.getParam('year') %}
{% if searchYear is not empty %}
  {% set queryParams = queryParams|merge({
    after: (searchYear * 1),
    before: (searchYear + 1),
  }) %}
{% endif %}

{# Build a category array beginning with 'and' and add targetElement objects with selected categories Ids to it #}
{% set categoriesArray = ['and'] %}

{% set searchTheme = craft.request.getParam('theme') %}
{% if searchTheme is not empty %}
  {% set searchThemeCat = craft.categories.slug(searchTheme).ids() %}
  {% set categoriesArray = categoriesArray|merge([{
    targetElement: searchThemeCat,
  }]) %}
{% endif %}

{% set searchTopic = craft.request.getParam('topic') %}
{% if searchTopic is not empty %}
  {% set searchTopicCat = craft.categories.slug(searchTopic).ids() %}
  {% set categoriesArray = categoriesArray|merge([{
    targetElement: searchTopicCat,
  }]) %}
{% endif %}

{# multiple vs single categories
- If there is more than just the "and" in the categoriesArray, use relatedTo and the categoriesArray to build the last part of our query
#}
{% if categoriesArray|length > 1 %}

  {% set queryParams = queryParams|merge({
    relatedTo: categoriesArray
  }) %}

{% endif %}

{# search #}
{% set searchQ = craft.request.getParam('q') %}
{% if searchQ is not empty %}
  {% set queryParams = queryParams|merge({
    search: {
      query: 'title:' ~ searchQ,
      subLeft: true,
      subRight: true,
    }
  }) %}
{% endif %}

{# number of items found #}
{% set totalEntries = craft.entries(queryParams).total() %}
<p>{{ totalEntries }} found in our database</p>

{# paginated blogposts #}
{% set blogEntries = craft.entries(queryParams) %}
{% paginate blogEntries as paginate, blogposts %}

{# entries loop #}
{% for item in blogposts %}

  {% if loop.first %}<ul>{% endif %}
    <li>
      <article>
        <h2><a href="{{ item.url }}">{{ item.title }}</a></h2>
        <p><time datetime="{{ item.postDate|date('Y-m-d') }}">{{ item.postDate|date("F j, Y") }}</time></p>
        <p>{{ item.summary }}</p>
      </article>
    </li>
  {% if loop.last %}</ul>{% endif %}

{% else %}

  <p>No blogpost found</p>

{% endfor %}{% endraw %}
```

## Taking care of pagination

Since this is a paginated list, we need to take care of the pagination interface so that our query parameters are also available in the pagination URLs built by Craft. In order to do that, we will simply use `craft.request` again, and specifically `getQueryStringWithoutPath()`.

```twig
{% raw %}{% set queryString = craft.request.getQueryStringWithoutPath() %}
{% set queryStringFull = (queryString is not empty) ? '?' ~ queryString : '' %}
{% if paginateInfo.prevUrl %}<a href="{{ paginateInfo.prevUrl ~ queryStringFull }}">Previous Page</a>{% endif %}
{% if paginateInfo.nextUrl %}<a href="{{ paginateInfo.nextUrl ~ queryStringFull }}">Next Page</a>{% endif %}{% endraw %}
```

That ensures that the various parameters now come along for the ride whenever a user clicks our pagination links.

## Voilà: job done

This kind of technique can be expanded to a lot of use cases. In my opinion, it is another testament to the flexibility provided by the combination of a mature templating language like Twig and a flexible CMS like Craft.
