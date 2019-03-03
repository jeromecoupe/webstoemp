---
title: "Jekyll: much more than a static blog generator"
excerpt: "When building this website, I had an in depth look at the latest version of Jekyll. Since I last looked at it, it had become a lot more powerful than a simple static blog generator, thanks to a few features."
image: "jekyll-logo.jpg"
imageAlt: "Jekyll static site generator"
categories:
- CMS
- Jekyll
- Collections
---

## In the beginning

[Jekyll](http://jekyllrb.com/) is a static site generator. It creates a static website based on your markdown-formatted content, mixed with liquid templates. As a [Mapbox](https://www.mapbox.com/) fan, I have been following the work of [Development Seed](http://www.developmentseed.org/) for a while. Back in 2011, these guys already said that [Jekyll could be more than a basic blog generator](http://www.developmentseed.org/blog/2011/09/09/jekyll-github-pages/).

It's true that the [YAML Front Matter](http://jekyllrb.com/docs/frontmatter/) used by Jekyll is extremely flexible and can be used creatively to define complex data structures for your posts and pages. No problem on that front.

But, before version 2.0, it lacked a clear way to define post types. Everything was either a post (a stream of entries ordered by date) or a page (a unique entry). To distinguish between two different post types (news and press releases for example), you had to rely heavily on categories.

Call me a pedant but, to me, categories should be used to create taxonomies, not to create various post types.

Well, sing and rejoice, Jekyll added collections and data since version 2.0.

## Collections

[Collections](http://jekyllrb.com/docs/collections/) are the Jekyll way to create different post types. Collections have essentially all the attributes "regular posts" always had in Jekyll.

To create a collection, you start by creating a folder in the root of your project. For example, let's create a `_projects` folder for your portfolio.

You then have to configure that collection in your `config.yml` file:

```yaml
collections:
  projects:
    output: true
    permalink: /work/:title
```

Collections can either be output into posts with a unique URL or be embedded in other templates. For example, quotes displayed on the homepage of a site don't need their own URL, whereas projects in a portfolio would. You can also specify the default permalink structure of your collections in your `_config.yml` file as you can do with the default `posts`.

We can manipulate those collections using liquid tags: `site.projects` is used to grab projects in that collection. We can also get to all collections by using `site.collections`.

So there you have it, custom post types in Jekyll. Collections are post types and each type can get a complex data structure through the YAML Front Matter.

## Data

Jekyll now also supports [formatted data](http://jekyllrb.com/docs/datafiles/) in the form of JSON, YAML or CSV files. Data are used for items having a spreadsheet-like nature and not needing their own URL or page. These data files are stored in the `_data` folder by default and output in templates using `site.data.filename`.

Let's say we create a file hosting all your social media accounts and usernames. Once stored in `/_data/socialmedia.yml`, we can then access the data using `site.data.socialmedia` and use it in our templates, most notably through a `for` loop.

## Default Front Matter values

With a growing number of collections or post types, [Front Matter Defaults](http://jekyllrb.com/docs/configuration/#front-matter-defaults) are coming in handy. These allow you to define smart defaults for all your collections in your `config.yml` file using a `default` key.

- `path` and `type` define the scope of the default values you are going to specify. An empty path means you are going to target all files in your site. The `type` corresponds to your post types.
- `values` is going to hold everything you would have set in the YAML Front Matter of those individual posts and that you want set by default. If you specify a key value pair for those in the YAML Front Matter of the posts themselves, it's going to overwrite the default value.

```yaml
defaults:
  -
    scope:
      path: ""
      type: "posts"
    values:
      layout: "blogpost"
      current_nav: "blog"
  -
    scope:
      path: "work"
      type: "projects"
    values:
      layout: "project"
      current_nav: "work"
```

## `group_by`, `where` and `sort` filters

Those [filters](http://jekyllrb.com/docs/templates/#filters) help you filter, sort or group items in posts, collections and data really easily.

For this blog, I wanted an archive of blogposts grouped by year and, since Github pages do not support them, I didn't want to use plugins. All I had to do was to create a `publication_year` variable in the YAML front matter of all my blogposts and use the group filter. Easy.

```liquid
{% raw %}{% assign postsByYear = site.posts | group_by:"publication_year" %}

{% for postsInYear in postsByYear %}
  {% if forloop.first %}<ul class="yearlyarchive">{% endif %}

  <li class="yearlyarchive__year">

    <h2 class="yearlyarchive__title">{{ postsInYear.name }}</h2>

    {% for item in postsInYear.items %}
      {% if forloop.first %}<ul class="yearlyarchive__list">{% endif %}

        <li class="yearlyarchive__item">
          {{ item.title }}
        </li>

      {% if forloop.last %}</ul>{% endif %}
    {% endfor %}

  </li>

  {% if forloop.last %}</ul>{% endif %}
{% endfor %}{% endraw %}
```

The `where` filter allows you to select all objects in an array where the key has a given value. Posts can be filtered by category or by any custom value we set in the YAML Front Matter.

The `sort` filter will let you sort arrays by any property. The `reverse` filter can then be used to sort things in ascending or descending order.

## Edit your content with Prose.io

One of the main drawbacks about Jekyll is that it is relatively difficult for clients to use, mainly because it lacks a backend / control panel to manage, create and edit posts.

Enter [Prose](http://prose.io/), a free online editor written in node.js by [Development Seed](http://www.developmentseed.org/) (I told you I was a fan). Prose can connect to any GitHub account and repository and offers a simple and fast WYSIWYG editor for your Markdown files, including the YAML Front Matter.

Prose can be hosted on your own server or used as a service. It can be [configured](https://github.com/prose/prose/wiki) on a per project basis via your `_config.yml` file to suit your client's and site's needs.

## In summary

Jekyll has come a long way since I last looked at it. It has become quite a competent tool and [its development is fast-paced](http://jekyllrb.com/news/).

I have definitely added it to my arsenal and I encourage you to look into it if you haven't in a long time. 3.0 is [already on the horizon](https://github.com/jekyll/jekyll/issues/2636).
