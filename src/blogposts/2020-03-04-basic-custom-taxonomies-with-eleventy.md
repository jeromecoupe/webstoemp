---
title: "Basic custom taxonomies with Eleventy"
excerpt: "Eleventy comes with a built-in tagging system. For a recent project, I wanted to use my own category system, which led me to dive a bit deeper into extending and configuring Eleventy."
image: "metal-drawers.jpg"
imageAlt: "Multiple metal drawers - Jesse Orico"
tags:
  - Eleventy
  - 11ty
  - JamStack
---

## Native approach using tags

The [tag system](https://www.11ty.dev/docs/collections/) Eleventy comes with allows you to group content items into collections automatically by specifying a `tags` key in those content items' front matters. For example, a post about milkshakes tagged as "foods" and "drinks" will appear in both `collections.foods` and `collections.drinks`.

You can then use pagination with a `size` of `1` to [automatically generate tag pages](https://www.11ty.dev/docs/quicktips/tag-pages/) that will list all content items belonging to that tag's collection. Paginating the posts listed on those tag pages is another story, but we'll get to that.

## Using custom categories

I generally don't use tags to create my collections. I prefer to use folders and the `getFilteredByGlob( glob )` API method to do so, but I often need basic custom taxonomies to categorise my content.

Eleventy being the flexible tool that it is, creating basic custom taxonomies is relatively straightforward.

Here is what we would need to create a custom "categories" taxonomy for our blogposts:

1. a `categories` key and an array of values in the front matters of each of our blogposts.
2. an array of all unique `categories` values used in each blogpost front matter.
3. a way to filter all blogposts with a specific value in their front matters under the `categories` key.

### Add keys and values to front matter

We'll start by adding a `categories` key to all blogposts and by specifying an array of categories for each of them.

```text
---
title: "This is an amazing travel blogpost with categories"
excerpt: "This blogpost is truly amazing and is listed under different categories, read on if you feel so inclined."
categories:
- awesomeness
- travel
---
```

### Automatically create a collection of unique categories

The easiest route here is to use the collections API in `.eleventy.js`. As a first step, we'll create a collection of all our blogposts.

```js
module.exports = function (eleventyConfig) {
  // blogposts collection
  eleventyConfig.addCollection("blogposts", function (collection) {
    return collection.getFilteredByGlob("./src/blogposts/*.md").reverse();
  });
};
```

Once we have done that, we need a collection of all categories used in all of our blogposts, so we can use it to generate our categories archive pages. Here are the steps we will follow:

1. Loop over every item in our `blogposts` collection, collect all arrays of categories and flatten them in one big array.
2. Remove capitalisation.
3. Remove duplicates.
4. Sort categories alphabetically.
5. Create a slug for each category using the slugify package.

We will use `lodash` to flatten the nested array and for some other tasks, so we need to install and import that as well.

```js
const lodash = require("lodash");
const slugify = require("slugify");

/**
 * Get all unique key values from a collection
 *
 * @param {Array} collectionArray - collection to loop through
 * @param {String} key - key to get values from
 */
function getAllKeyValues(collectionArray, key) {
  // get all values from collection
  let allValues = collectionArray.map((item) => {
    let values = item.data[key] ? item.data[key] : [];
    return values;
  });

  // flatten values array
  allValues = lodash.flattenDeep(allValues);
  // to lowercase
  allValues = allValues.map((item) => item.toLowerCase());
  // remove duplicates
  allValues = [...new Set(allValues)];
  // order alphabetically
  allValues = allValues.sort(function (a, b) {
    return a.localeCompare(b, "en", { sensitivity: "base" });
  });
  // return
  return allValues;
}

/**
 * Transform a string into a slug
 * Uses slugify package
 *
 * @param {String} str - string to slugify
 */
function strToSlug(str) {
  const options = {
    replacement: "-",
    remove: /[&,+()$~%.'":*?<>{}]/g,
    lower: true,
  };

  return slugify(str, options);
}

module.exports = function (eleventyConfig) {
  // create blog collection
  eleventyConfig.addCollection("blogposts", function (collection) {
    return collection.getFilteredByGlob("./src/blogposts/*.md").reverse();
  });

  // create blog categories collection
  eleventyConfig.addCollection("blogCategories", function (collection) {
    let allCategories = getAllKeyValues(
      collection.getFilteredByGlob("./src/blogposts/*.md"),
      "categories"
    );

    let blogCategories = allCategories.map((category) => ({
      title: category,
      slug: strToSlug(category),
    }));

    return blogCategories;
  });

  // filters
  eleventyConfig.addFilter("date", require("./filters/dateformat.js"));
  eleventyConfig.addFilter("include", require("./filters/include.js"));

  // return modified config
  return {
    dir: {
      input: "./src",
      output: "./dist",
    },
  };
};
```

### Filter blogposts by categories

We can now create our categories pages by paginating the `blogCategories` collection. In that template, we will use a custom `includes` filter to get only the blogposts containing the category we are interested in from the `blogposts` collection. That filter compares values without taking accentuated characters or capitalisation into account. It also uses `lodash`.

```js
const lodash = require("lodash");

/**
 * Select all objects in an array
 * where the path includes the value to match
 * capitalisation and diacritics are removed from compared values
 *
 * @param {Array} arr - array of objects to inspect
 * @param {String} path - path to inspect for each object
 * @param {String} value - value to match
 * @return {Array} - new array
 */

module.exports = function (arr, path, value) {
  value = lodash.deburr(value).toLowerCase();
  return arr.filter((item) => {
    let pathValue = lodash.get(item, path);
    pathValue = lodash.deburr(pathValue).toLowerCase();
    return pathValue.includes(value);
  });
};
```

And here is a bare-bones template using pagination with a `size` of `1` and that `includes` filter to create our categories pages.

```twig
{%- raw -%}
---
pagination:
  data: collections.blogCategories
  size: 1
  alias: category
permalink: /blog/category/{{ category.slug }}/index.html
---
{% extends "layouts/base.njk" %}

{% block content %}

  <h2>Blog category: {{ category.title }}</h2>
  {% set posts = collections.blogposts | include("data.categories", category.title) %}
  {% for post in posts %}
    {% if loop.first %}<ul>{% endif %}
      <li>
        <article>
          <p><time datetime="{{ post.date | date('YYYY-MM-DD') }}">{{ post.date | date("MMMM Do, YYYY") }}</time></p>
          <h2><a href="{{ post.url }}">{{ post.data.title }}</a></h2>
        </article>
      </li>
    {% if loop.last %}</ul>{% endif %}
  {% endfor %}

  <h3>Categories</h3>
  {% for category in collections.blogCategories %}
    {% if loop.first %}<ul><li><a href="/blog/">All</a></li>{% endif %}

    <li>
      <a href="/blog/category/{{ category.slug }}">{{ category.title }}</a>
    </li>

    {% if loop.last %}</ul>{% endif %}
  {% endfor %}

{% endblock %}
{%- endraw -%}
```

As a first step, we replicated the native tag-based functionality using our own custom category system.

Since we already used pagination to create our categories pages, we cannot use it in the same template to paginate our posts. That being said, [Zach Leatherman's answer to this issue on Github](https://github.com/11ty/eleventy/issues/332#issuecomment-445236776) points to a way to format our data to get around that current limitation of Eleventy.

## Two levels of pagination

In order to use Zach's solution, we need to massage our data into a collection where each item is a page of the paginated results we want for each theme. We can then use pagination with a `size` of `1` to create category pages with paginated posts.

If we have three blogposts in the "travel" category and one in the "awesomeness" category and we want two posts per page, we will need data in the following format:

```text
[
  {
    title: 'travel',
    slug: 'travel',
    pageNumber: 0,
    totalPages: 2,
    pageSlugs: {
      all: [],
      next: 'travel/2',
      previous: null,
      first: 'travel',
      last: 'travel/2'
    },
    items: [{},{}]
  },
  {
    title: 'travel',
    slug: 'travel/2',
    pageNumber: 1,
    totalPages: 2,
    pageSlugs: {
      all: [],
      next: null,
      previous: 'travel',
      first: 'travel',
      last: 'travel/2'
    },
    items: [{}]
  },
  {
    title: 'awesomeness',
    slug: 'awesomeness',
    pageNumber: 0,
    totalPages: 1,
    pageSlugs: {
      all: [],
      next: null,
      previous: null,
      first: 'awesomeness',
      last: 'awesomeness'
    },
    items: [{}]
  }
]
```

Using some array manipulation, we can create such a collection in our `.eleventy.js` file.

```js
// create flattened paginated blogposts per categories collection
// based on Zach Leatherman's solution - https://github.com/11ty/eleventy/issues/332
eleventyConfig.addCollection("blogpostsByCategories", function (collection) {
  const itemsPerPage = 2;
  let blogpostsByCategories = [];
  let allBlogposts = collection
    .getFilteredByGlob("./src/blogposts/*.md")
    .reverse();
  let blogpostsCategories = getAllKeyValues(allBlogposts, "categories");

  // walk over each unique category
  blogpostsCategories.forEach((category) => {
    let sanitizedCategory = lodash.deburr(category).toLowerCase();
    // create array of posts in that category
    let postsInCategory = allBlogposts.filter((post) => {
      let postCategories = post.data.categories ? post.data.categories : [];
      let sanitizedPostCategories = postCategories.map((item) =>
        lodash.deburr(item).toLowerCase()
      );
      return sanitizedPostCategories.includes(sanitizedCategory);
    });

    // chunck the array of posts
    let chunkedPostsInCategory = lodash.chunk(postsInCategory, itemsPerPage);

    // create array of page slugs
    let pagesSlugs = [];
    for (let i = 0; i < chunkedPostsInCategory.length; i++) {
      let categorySlug = strToSlug(category);
      let pageSlug = i > 0 ? `${categorySlug}/${i + 1}` : `${categorySlug}`;
      pagesSlugs.push(pageSlug);
    }

    // create array of objects
    chunkedPostsInCategory.forEach((posts, index) => {
      blogpostsByCategories.push({
        title: category,
        slug: pagesSlugs[index],
        pageNumber: index,
        totalPages: pagesSlugs.length,
        pageSlugs: {
          all: pagesSlugs,
          next: pagesSlugs[index + 1] || null,
          previous: pagesSlugs[index - 1] || null,
          first: pagesSlugs[0] || null,
          last: pagesSlugs[pagesSlugs.length - 1] || null,
        },
        items: posts,
      });
    });
  });

  return blogpostsByCategories;
});
```

Now, by using the following template with a pagination `size` of `1`, we will get paginated blogposts for our categories pages.

```twig
{%- raw -%}
---
pagination:
  data: collections.blogpostsByCategories
  size: 1
  alias: category
permalink: /blog/category/{{ category.slug }}/index.html
---
{% extends "layouts/base.njk" %}

{% block content %}

  <h2>Blog category: {{ category.title }}</h2>
  {% for post in category.items %}
    {% if loop.first %}<ul>{% endif %}
      <li>
        <article>
          <p><time datetime="{{ post.date | date('YYYY-MM-DD') }}">{{ post.date | date("MMMM Do, YYYY") }}</time></p>
          <h2><a href="{{ post.url }}">{{ post.data.title }}</a></h2>
        </article>
      </li>
    {% if loop.last %}</ul>{% endif %}
  {% endfor %}

  {% if category.totalPages > 1 %}
    <ul>
      {% if category.pageSlugs.previous %}<li><a href="/blog/category/{{ category.pageSlugs.previous }}/">Previous</a></li>{% endif %}
      {% if category.pageSlugs.next %}<li><a href="/blog/category/{{ category.pageSlugs.next }}/">Next</a></li>{% endif %}
    </ul>
  {% endif %}

  <h3>Categories</h3>
  {% for category in collections.blogCategories %}
    {% if loop.first %}
      <p><a href="/blog/">All</a></p>
    {% endif %}
    <p><a href="/blog/category/{{ category.slug }}">{{ category.title }}</a></p>
  {% endfor %}

{% endblock %}
{%- endraw -%}
```

## My two cents on pagination

From my perspective, paginating posts on tag or category pages is a relatively common requirement, even for simple websites that have a fair amount of content, like blogs for example. In my humble opinion, pagination as it currently stands has two distinct drawbacks:

1. It can be used to generate single pages from data/collections and to paginate arrays and objects, which can make it confusing for newcomers.
2. Since it lives in the front-matter of templates, it can only be used once per template instead of being usable in context with any iterable.

If most use cases are limited to two levels of depth, then distinguishing pagination from single pages generation would probably fit the bill, since we could then combine both usages. Maybe something like a `generatePages()` collection method would be a good candidate.

If what’s needed is unlimited levels of depth, most other systems I have used (SSG/CMS) have something like a filter or tag that paginates any iterable in a template where needed. They return a chunked nested array of items, along with variables needed to create pagination interfaces. The closest thing I can think about in Eleventy today is [the navigation plugin](https://www.11ty.dev/docs/plugins/navigation/), but a pagination plugin is a big departure from what currently exists.
