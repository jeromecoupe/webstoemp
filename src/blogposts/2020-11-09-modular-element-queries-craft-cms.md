---
title: "Modular element queries with Craft CMS"
excerpt: "In Craft 3, elements queries parameters use dot syntax exclusively, which changed how to implement search and filters with modular element queries. Here is a quick rundown of how I approach it nowadays."
image: "cocktails.jpg"
imageAlt: "Mixing cocktails - Photo by Mikey Harris"
tags:
  - Craft
  - Search
  - Filters
  - Twig
---

## Then and now

With Craft 2, [my go-to approach](/blog/manipulating-craft-elementcriteriamodel-with-twig/) to build [modular element queries](/blog/combined-searches-and-filters-craft-cms/) was to manipulate objects with Twig before passing them to element queries as parameters. Here is a basic example using categories and relations in Craft 2.

```twig
{%- raw %}
{# get category ID from URL parameter #}
{% set selectedCatId = craft.request.getParam('category') ?? null %}

{# initial query parameters #}
{% set queryParams = {
  section: 'blog',
  order: 'postDate desc',
  limit: 10
} %}

{# add relatedTo if needed #}
{% if selectedCatId %}
  {% set queryParams = queryParams|merge({
    relatedTo: selectedCatId
  }) %}
{% endif %}

{# execute query #}
{% set blogposts = craft.entries(queryParams).find() %}
{% endraw %}
```

Since version 3, Craft favours the use of dot syntax and chained functions, which means we have to change our approach slightly. However, we can essentially accomplish the same thing using Twig's `{% raw %}{% do %}{% endraw %}` tag.

The [Twig documentation](https://twig.symfony.com/doc/3.x/tags/do.html) is quite succinct and could probably be fleshed but a little bit. Essentially, `do` executes whatever is passed to it but does not print or return any value, which is exactly what we need.

```twig
{%- raw %}
{# get category ID from URL parameter #}
{% set selectedCatId = craft.app.request.getParam("category") ?? null %}

{# initial query #}
{% set query = craft.entries()
  .section("blog")
  .orderBy("postDate desc")
  .limit(10) %}

{# add relatedTo if needed #}
{% if selectedCatId %}
  {% do query.relatedTo(selectedCatId) %}
{% endif %}

{# execute query #}
{% set blogposts = query.all() %}
{% endraw %}
```

## Cumulative filters and search

Here is a slightly more advanced example involving categories, publication years and search.

We want a paginated list of blogposts and the ability to filter them by publication year, by categories and also be able to search on titles. The search and filters should be cumulative. For example, we want to be able to search all blogposts published in 2016, belonging to the "Gardening" category and that have "Brad" in their title.

Here is the plan:

1. create a form using `post` or `get` to set parameters and values (use `get` if you want the parameters and values to be visible in the URL)
2. retrieve values using `craft.app.request.getParam()`
3. create a base query
4. add parameters to base query as needed using retrieved values

```twig
{%- raw %}
{# -------------------------------------------------
layout
------------------------------------------------- #}

{% extends "_layouts/base.twig" %}


{# -------------------------------------------------
variables
------------------------------------------------- #}

{# get parameters from request and set default values #}
{% set searchTerm = craft.app.request.getParam("search") ?? null %}
{% set selectedCatId = craft.app.request.getParam("category") ?? null %}
{% set selectedYear = craft.app.request.getParam("year") ?? null %}

{# All blogposts query #}
{% set allBlogpostsQuery = craft.entries()
  .section("blogposts")
  .orderBy("postDate desc")
  .limit(null) %}

{# all blogposts #}
{% set allBlogposts = allBlogpostsQuery.all() %}

{# total blogposts #}
{% set totalBlogposts = allBlogpostsQuery.count() %}

{# get all categories #}
{% set allBlogCategories = craft.categories()
  .group("blogCategories")
  .orderBy("title")
  .relatedTo(allBlogposts)
  .all() %}

{# Years with blogposts published #}
{% set years = allBlogposts|group("postDate|date('Y')")|keys %}

{# override limit for pagination #}
{% set filteredBlogposts = allBlogpostsQuery.limit(2) %}

{# add before/after params if needed #}
{% if selectedYear %}
  {% do filteredBlogposts.after(selectedYear).before(selectedYear + 1) %}
{% endif %}

{# add relatedTo param if needed #}
{% if selectedCatId %}
  {% do filteredBlogposts.relatedTo(selectedCatId) %}
{% endif %}

{# add search param if needed #}
{% if searchTerm %}
  {% do filteredBlogposts.search('title:' ~ searchTerm) %}
{% endif %}

{# count results of modular query #}
{% set results = filteredBlogposts.count() %}


{# -------------------------------------------------
template
------------------------------------------------- #}

{% block content %}
  {# search form #}
  <form action="{{ url(craft.app.request.pathInfo) }}" method="post">
    <h2>Search blogposts</h2>

    {# years #}
    {% if years|length %}
      <div>
        <label for="years">Year: </label>
        {# output years #}
        {% for year in years %}
          {% if loop.first %}<select name="year" id="years">{% endif %}

            {% if loop.first %}<option value="">All</option>{% endif %}
            {% set selected = (selectedYear == year) ? "selected" : "" %}
            <option value="{{ year }}" {{ selected }}>{{ year }}</option>

          {% if loop.last %}</select>{% endif %}
        {% endfor %}
      </div>
    {% endif %}

    {# categories #}
    {% if allBlogCategories|length %}
      <div>
        <label for="cat">Category: </label>
        {# output categories #}
        {% for category in allBlogCategories %}
          {% if loop.first %}<select name="category" id="cat">{% endif %}

            {% if loop.first %}<option value="">All</option>{% endif %}
            {% set selected = (selectedCatId == category.id) ? "selected" : "" %}
            <option value="{{ category.id }}" {{ selected }}>{{ category.title }}</option>

          {% if loop.last %}</select>{% endif %}
        {% endfor %}
      </div>
    {% endif %}

    {# search #}
    <div>
      {% set searchValue = searchTerm ?? "" %}
      <label for="q">Search: </label>
      <input type="search" id="q" name="search" value="{{ searchValue }}">
    </div>
    <div>
      <input type="submit" value="Search entries">
    </div>

  </form>

  {# display results / total #}
  <h2>Results</h2>
  <p>{{ results }} result{% if results > 1 %}s{% endif %} found in {{ totalBlogposts }} blogposts.</p>

  {# paginate filtered entries #}
  {% paginate filteredBlogposts as pagination, entries %}
  {% for entry in entries %}
    {% if loop.first %}<ul>{% endif %}

    <li>
      <article>
        <p><time datetime="{{ entry.postDate|date('Y-m-d') }}">{{ entry.postDate|date('F d, Y') }}</time></p>
        <h3><a href="{{ entry.url }}">{{ entry.title }}</a></h3>
        <p>{{ entry.commonSummary }}</p>
      </article>
    </li>

    {% if loop.last %}</ul>{% endif %}
  {% endfor %}

  {# pagination #}
  {% if pagination.totalPages > 1 %}
    {% if pagination.prevUrl %}
      <a href="{{ pagination.prevUrl }}">Previous Page</a>
    {% endif %}
    {% if pagination.nextUrl %}
      <a href="{{ pagination.nextUrl }}">Next Page</a>
    {% endif %}
  {% endif %}

{% endblock %}
{% endraw %}
```

## Mainly a shift in syntax

In most cases, modular element queries can be created using `{% raw %}{% do %}{% endraw %}` and dot syntax instead manipulating objects with Twig before feeding them to element queries as parameters. I would even argue that the code is a bit more legible.

The most important thing for me is that, combined with Twig as a templating language, Craft remains a very flexible and, dare I say it, elegant tool to retrieve and display data as well as to structure it.
