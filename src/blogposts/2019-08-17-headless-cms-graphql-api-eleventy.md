---
title: "Consuming a headless CMS GraphQL API with Eleventy"
excerpt: "With Eleventy, consuming data coming from a GraphQL API to generate static pages is as straightforward as using Markdown files."
image: "eleventy-graphql.jpg"
imageAlt: "Eleventy and GraphQL sitting in a tree"
tags:
  - GraphQL
  - Eleventy
  - 11ty
  - Jamstack
---

## The many flavours of headless CMSes

If you want to add [a headless CMS](https://headlesscms.org/) to a JAMstack website, you have the choice between two main approaches: Git-backed or API driven.

Both will present content creators with a familiar graphical interface, but what happens behind the scene when content is created, modified or deleted is quite different.

### Git-backed headless CMSes

Git-backed CMSes like [Netlify CMS](https://www.netlifycms.org/) or [Forestry](https://forestry.io/) will save your content in text files and commit them to your git repository. This is my favourite approach for the following reasons:

- content and code share the same workflow
- content is version controlled by git with a clear history
- content in the form of text files (markdown, YAML, etc.) is highly portable

### API driven headless CMSes

API driven CMSes like [Contentful](https://www.contentful.com/) or [DatoCMS](https://www.datocms.com/) will save your content in a database in the cloud and make it available through an API. If you want to host your own data, [Craft CMS](https://craftcms.com/) and its [first party GraphQL API](https://docs.craftcms.com/v3/graphql.html) makes it a great option, too. GraphQL is quickly a becoming popular way to query and consume those APIs. In my opinion this approach is interesting when:

- content is consumed by various platforms
- the project needs highly relational content models

## Project structure

[Eleventy](https://www.11ty.dev/) (11ty), which is quickly becoming my static site generator of choice, can handle both approaches fairly elegantly and with a minimal amount of efforts. Querying a GraphQL API and using the returned data to generate static pages is actually a straightforward and simple process. Who knew?

[DatoCMS](https://www.datocms.com/) is a headless CMS I have recommended to clients in the past. Pricing and options are fair, it is very flexible, it handles locales elegantly and has good developer and user experiences.

Although this blogpost is geared towards DatoCMS, this methodology is applicable to any headless CMS offering a GraphQL API.

Here is the folder architecture we will be working with in Eleventy, which is a fairly basic one:

```text
+-- src
  +-- _data
      +-- blogposts.js
  +-- _includes
      +-- layouts
          +-- base.njk
  +-- blogposts
      +-- entry.njk
      +-- list.njk
+-- .eleventy.js
+-- .env
+-- .env.example
+-- package-lock.json
+-- package.json
```

## DatoCMS configuration

After getting a DatoCMS account, we need a data model and some entries in DatoCMS. For this example, I created a data model called `blogposts` with a series of fields and a few entries.

We can then use our [API token](https://www.datocms.com/docs/content-delivery-api/authentication) to connect to the [GraphQL API Explorer](https://cda-explorer.datocms.com/) and see what queries and options are available and what JSON is returned.

Again, most headless CMSes with a GraphQL API offer this functionality in some form or fashion.

## Eleventy configuration

We will need our [API token](https://www.datocms.com/docs/content-delivery-api/authentication) to authenticate with the DatoCMS GraphQL server. We can use [`dotenv`](https://www.npmjs.com/package/dotenv) to store it in a `.env` file that we add to our `.gitignore` so it does not end up in our repository. After installing the package, we create a `.env` file at the root of the project and add our DatoCMS API token to it:

```text
DATOCMS_TOKEN="123token"
```

Then, we just need to add the following line at the top of our `.eleventy.js` file:

```js
require("dotenv").config();
```

Since that file is processed really early by [Eleventy](https://www.11ty.dev/), our token will be available anywhere in our templates using `process.env.DATOCMS_TOKEN`.

## Using JavaScript data files

Instead of getting our data using collections and markdown files with YAML front matters, we are going to use [Eleventy's Javascript data files](https://www.11ty.dev/docs/data-js/). We will use `src/_data/blogposts.js` to connect to DatoCMS' [Content Delivery API](https://www.datocms.com/docs/content-delivery-api/) at build time and export a JSON file containing a list of all blogposts with all the fields we need. The content of that file will be available in our templates under the `blogposts` key.

Eleventy will then be able to use that single JSON file to build all detail and list pages for our blog.

Here is the full file required to retrieve all our blogposts. The code is based on the [Vanilla JS request example](https://www.datocms.com/docs/content-delivery-api/first-request#vanilla-js-example) available in the DatoCMS documentation.

I went with `node-fetch` rather than Apollo and friends to minimise dependencies.

The GraphQL API from DatoCMS has a hard limit: you can only get 100 records per query (thanks to [Dan Fascia](https://twitter.com/danfascia) for pointing that out to me initially). If we have a large blog of more than 100 posts, we just have to make multiple queries and concatenate the results to make sure we get all blogposts.

```js
// required packages
const fetch = require("node-fetch");

// DatoCMS token
const token = process.env.DATOCMS_TOKEN;

// get blogposts
// see https://www.datocms.com/docs/content-delivery-api/first-request#vanilla-js-example
async function getAllBlogposts() {
  // max number of records to fetch per query
  const recordsPerQuery = 100;

  // number of records to skip (start at 0)
  let recordsToSkip = 0;

  // do we make a query ?
  let makeNewQuery = true;

  // Blogposts array
  let blogposts = [];

  // make queries until makeNewQuery is set to false
  while (makeNewQuery) {
    try {
      // initiate fetch
      const dato = await fetch("https://graphql.datocms.com/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          query: `{
            allBlogposts(
              first: ${recordsPerQuery},
              skip: ${recordsToSkip},
              orderBy: _createdAt_DESC,
              filter: {
                _status: {eq: published}
              }
            )
            {
              id
              title
              slug
              intro
              body(markdown: true)
              _createdAt
              image {
                url
                alt
              }
              relatedBlogs {
                id
              }
            }
          }`,
        }),
      });

      // store the JSON response when promise resolves
      const response = await dato.json();

      // handle DatoCMS errors
      if (response.errors) {
        let errors = response.errors;
        errors.map((error) => {
          console.log(error.message);
        });
        throw new Error("Aborting: DatoCMS errors");
      }

      // update blogpost array with the data from the JSON response
      blogposts = blogposts.concat(response.data.allBlogposts);

      // prepare for next query
      recordsToSkip += recordsPerQuery;

      // stop querying if we are getting back less than the records we fetch per query
      if (response.data.allBlogposts.length < recordsPerQuery) {
        makeNewQuery = false;
      }
    } catch (error) {
      throw new Error(error);
    }
  }

  // format blogposts objects
  const blogpostsFormatted = blogposts.map((item) => {
    return {
      id: item.id,
      date: item._createdAt,
      title: item.title,
      slug: item.slug,
      image: item.image.url,
      imageAlt: item.image.alt,
      summary: item.intro,
      body: item.body,
      relatedBlogs: item.relatedBlogs,
    };
  });

  // return formatted blogposts
  return blogpostsFormatted;
}

// export for 11ty
module.exports = getAllBlogposts;
```

Instead of directly using data from the JSON response, I generally reformat it to future proof my templates a little. If something changes at the CMS level, I know I only have to fiddle with data files, not with all the templates that are using them.

### Images and thumbnails

Every file or image uploaded to DatoCMS is stored on [Imgix](https://www.imgix.com/), which means we can simply [add some parameters to any image URL](https://docs.imgix.com/apis/url) to resize, crop, and manipulate them in various ways. These transformations happen on-the-fly and get cached on the CDN as well for future reuse.

Most headless CMSes out there will offer you similar functionalities, either by integrating with third party services like [Cloudinary](https://cloudinary.com/) or [Uploadcare](https://uploadcare.com/) or by having their own images API.

### Relational fields

DatoCMS' GraphQL API deals very well will deep data structures and will easily let you retrieve the data you need from your relational fields. However, I generally rely on a simpler approach:

- Create a big JSON file for each data types (blogposts, projects, sponsors, etc), each content item has a unique ID
- For relational fields, only get the IDs of related items
- Use nested loops at the template level to get the data we need using IDs

Since fast static sites generators like [Hugo](https://gohugo.io/) or Eleventy have a very low performance penalty for loops at the template level, I never encountered major performance problems with this solution. It gives you a lot of flexibility and keeps your queries simple and flat.

## Generate a paginated list of blogposts with 11ty

Using the [pagination feature](https://www.11ty.dev/docs/pagination/) of Eleventy, we can easily walk through our JSON file (accessible via the `blogposts` key) and generate a paginated list of blogposts. In this case, we are going to generate a paginated list with 12 items on each page, as specified by the `size` key.

Here is the full code for `src/blogposts/list.njk`:

```twig
{%- raw %}
---
pagination:
  data: blogposts
  size: 12
permalink: blog{% if pagination.pageNumber > 0 %}/page{{ pagination.pageNumber + 1}}{% endif %}/index.html
---

{% extends "layouts/base.njk" %}
{% set htmlTitle = item.title %}

{% block content %}
  <h1>Blogposts</h1>

  {# loop through paginated item #}
  {% for item in pagination.items %}
    {% if loop.first %}<ul>{% endif %}
      <li>
        <p><img src="{{ item.image }}?fit=crop&amp;w=200&amp;h=200" alt="{{ item.imageAlt }}"></p>
        <h2><a href="/blog/{{ item.slug }}">{{ item.title }}</a></h2>
        <p><time datetime="{{ item.date | date('Y-M-DD') }}">{{ item.date|date("MMMM Do, Y") }}</time></p>
        <p>{{ item.summary }}</p>
      </li>
    {% if loop.last %}</ul>{% endif %}
  {% endfor %}

  {# pagination #}
  {% if pagination.hrefs | length > 0 %}
  <ul>
    {% if pagination.previousPageHref %}
      <li><a href="{{ pagination.previousPageHref }}">Previous page</a></li>
    {% endif %}
    {% if pagination.nextPageHref %}
      <li><a href="{{ pagination.nextPageHref }}">Next page</a></li>
    {% endif %}
  </ul>
  {% endif %}

{% endblock %}
{% endraw %}
```

## Generate individual posts with 11ty

Using the same pagination feature, we can also easily generate all our individual pages. The only trick here is to use pagination with a size of 1, combined with dynamic permalinks. Here is the full code for `src/blogposts/entry.njk`:

```twig
{%- raw %}
---
pagination:
  data: blogposts
  size: 1
  alias: blogpost
permalink: blog/{{ blogpost.slug }}/index.html
---
{% extends "layouts/base.njk" %}
{% set htmlTitle = blogpost.title %}

{% block content %}
  {# blogpost #}
  <img src="{{ blogpost.image }}?fit=crop&amp;w=1024&amp;h=576"
       srcset="{{ blogpost.image }}?fit=crop&amp;w=600&amp;h=338 600w,
               {{ blogpost.image }}?fit=crop&amp;w=800&amp;h=450 800w,
               {{ blogpost.image }}?fit=crop&amp;w=1024&amp;h=576 1024w"
       sizes="100vw"
       class="u-fluidimg"
       alt="{{ blogpost.imageAlt }}">

  <h1>{{ blogpost.title }}</h1>
  <p><time datetime="{{ blogpost.date | date('Y-M-DD') }}">{{ blogpost.date|date("MMMM Do, Y") }}</time></p>
  <p>{{ blogpost.intro }}</p>
  {{ blogpost.body | safe }}

  {# related blogposts #}
  {% if blogpost.relatedBlogs|length %}
    <h2>You might also like</h2>
    <ul>
    {% for item in blogpost.relatedBlogs %}
      {% for post in blogposts %}
        {% if post.id == item.id %}
          <li>
            <a href="/blog/{{ post.slug }}">{{ post.title }}</a>
          </li>
        {% endif %}
      {% endfor %}
    {% endfor %}
    </ul>
  {% endif %}
{% endblock %}
{% endraw %}
```

## Trigger builds automatically

Most headless CMSes will provide webhooks that will send a request to a URL when data changes. If you are hosting your site on [Netlify](https://www.netlify.com/) (why wouldn't you, they're awesome), [creating a build hook](https://www.netlify.com/docs/webhooks/) is a couple of clicks away. That build hook will give us a URL that will trigger a site build when hit by a POST request.

DatoCMS offers a one-click deployment integration with Netlify. We just have to activate it and voilà, our blog is rebuilt every time the data changes.

We now have a blog that combines the power of a relational database with the speed and reliability of a static, CDN hosted website.
