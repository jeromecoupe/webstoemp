---
title: "Consuming a headless CMS GraphQL API with Eleventy"
excerpt: "Although I generally use git-based CMSes for Jamstack projects, Eleventy makes it trivial to generate a static site using data coming from a GraphQL API if you need the option."
image: "eleventy-graphql.jpg"
imageAlt: "Eleventy and GraphQL logos"
tags:
- GraphQL
- Eleventy
- 11ty
- Jamstack
---

## API based headless CMS

I generally go with a git-based CMS like [Netlify CMS](https://www.netlifycms.org/) or [Forestry](https://forestry.io/) for JAMstack projects. That being said, there are cases where, in my opinion, an API-based headless CMS makes more sense. For example, if your data needs to be consumed by various platforms or if your data models are highly relational, using text files might not be ideal.

[A whole bunch of API driven headless CMSes](https://headlesscms.org/) are available on the market, and a lot of them offer GraphQL as a query language. [DatoCMS](https://www.datocms.com/) is a solution I have recommended to clients in the past. Pricing and options are fair, it is very flexible, it handles locales elegantly and has good developer and user experiences.

That being said, this methodology is applicable with any headless CMS offering a GraphQL API.

## Project structure

Here is the folder architecture we will be working with:

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

After getting a DatoCMS account, create a data model and some entries in DatoCMS. For this example, I created a data model called `blogposts` with a series of fields and a few entries.

We can then use our [API token](https://www.datocms.com/docs/content-delivery-api/authentication) to connect to the [GraphQL API Explorer](https://cda-explorer.datocms.com/) and see what queries and options are available and what JSON is returned.

Again, most headless CMSes with a GraphQL API offer this functionality in some form or fashion.

## 11ty configuration

We will need our [API token](https://www.datocms.com/docs/content-delivery-api/authentication) to authenticate with the DatoCMS GraphQL server. We can use [`dotenv`](https://www.npmjs.com/package/dotenv) to store it in a `.env` file that we add to our `.gitignore` so it does not end up in our repository. After installing the package, we create a `.env` file at the root of the project and add our DatoCMS API token to it:

```text
DATOCMS_TOKEN="123token"
```

Then, we just need to add the following line at the top of our `.eleventy.js` file:

```js
require("dotenv").config();
```

Since that file is processed really early by [Eleventy](https://www.11ty.io/), our token will be available anywhere in our templates using `process.env.DATOCMS_TOKEN`.

## Retrieve data with JavaScript data files

Instead of getting our data using collections and markdown files with YAML front matters, we are going to use [Eleventy's Javascript data files](https://www.11ty.io/docs/data-js/). We will use `src/_data/blogposts.js` to connect to DatoCMS' [Content Delivery API](https://www.datocms.com/docs/content-delivery-api/) at build time and export a JSON file containing a list of all blogposts with all the fields we need. The content of that file will be availble in our templates under the `blogposts` key.

Eleventy will then be able to use that single JSON file to build all detail and list pages for our blog.

Here is the full file required to retrieve all our blogposts. The code is based on the [Vanilla JS request example](https://www.datocms.com/docs/content-delivery-api/first-request#vanilla-js-example) available in the DatoCMS documentation.

I went with `node-fetch` rather than Apollo and friends to minimise dependencies.

```js
// required packages
const fetch = require("node-fetch");

// DatoCMS token
const token = process.env.DATOCMS_TOKEN;

// GraphQL query
const blogpostsQuery = `
  {
    allBlogposts(orderBy: _createdAt_DESC, filter: {_status: {eq: published}}) {
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
  }
`;

// get blogposts
// see https://www.datocms.com/docs/content-delivery-api/first-request#vanilla-js-example
function getAllBlogposts() {
  // fetch data
  const data = fetch("https://graphql.datocms.com/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      query: blogpostsQuery
    })
  })
    // parse as JSON
    .then(res => res.json())

    // Handle JSON data
    .then(res => {
      // handle Dato CMS errors if in response
      if (res.errors) {
        res.errors.forEach(error => {
          console.log(error.message);
        });
        throw new Error("DatoCMS errors");
      }

      // get blogposts data
      let blogpostsData = res.data.allBlogposts;

      // format data
      let blogpostsFormatted = blogpostsData.map(item => {
        return {
          id: item.id,
          date: item._createdAt,
          title: item.title,
          slug: item.slug,
          image: item.image.url,
          imageAlt: item.image.alt,
          summary: item.intro,
          body: item.body,
          relatedBlogs: item.relatedBlogs
        };
      });

      // return formatted data
      return blogpostsFormatted;
    })
    .catch(error => {
      console.log(error);
    });

  // return data
  return data;
}

// export for 11ty
module.exports = getAllBlogposts;
```

Instead of directly using data from the JSON response, I generally reformat it to future proof my templates a little. If something changes at the CMS level, I know I only have to fiddle with the data files, not with all the templates that are using it.

### Images and thumbnails

Every file or image uplodaded to DatoCMS is stored on [Imgix](https://www.imgix.com/), which means we can simply [add some parameters to any image URL](https://docs.imgix.com/apis/url) to resize, crop, and manipulate them in various ways. These transformations happen on-the-fly and get cached on the CDN as well for future reuse.

Most headless CMSes out there will offer you similar functionalities, either by integrating with third party services like [Cloudinary](https://cloudinary.com/) or [Uploadcare](https://uploadcare.com/) or by having their own images API.

### Relational fields

DatoCMS' GraphQL API deals very well will deep data structures and will easily let you retrieve the data you need from your relational fields. However, I generally rely on a simpler approach:

- Create a big JSON file for each data types (blogposts, projects, sponsors, etc), each content item has a unique ID
- For relational fields, only get the IDs of related items
- Use nested loops at the template level to get the data we need using IDs

Since fast static sites geneators like [Hugo](https://gohugo.io/) or Eleventy have a very low performance penalty for loops at the template level, I never encountered major performance problems with this solution. It gives you a lot of flexibility and keeps your data structures simple and flat.

## Generate a paginated list of blogposts with 11ty

Using the [pagination feature](https://www.11ty.io/docs/pagination/) of Eleventy, we can easily walk through our JSON file and generate a paginated list of blogposts. Here is the full code for `src/blogposts/list.njk`:

```twig
{% raw %}
---
pagination:
  data: blogposts
  size: 2
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

Using the same pagination feature, we can also easily generate all our indivisual pages. Here is the full code for `src/blogposts/entry.njk`:

```twig
{% raw %}
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
       sizes="100 vw"
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
