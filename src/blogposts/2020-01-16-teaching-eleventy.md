---
title: "Teaching in the open: Eleventy"
excerpt: "Content Management Systems and structured data are part of my teaching duties. From the get go, I decided to cover both a database-driven CMS and a Static Site Generator. As far as the latter goes, I switched from Jekyll to Eleventy this year."
image: "eleventy-possum.jpg"
imageAlt: "Eleventy possum floating under a red balloon"
tags:
  - Eleventy
  - 11ty
  - Jamstack
---

## Decoupling

Both as a teacher and as a freelancer, I firmly believe that the [JAMstack movement](https://jamstack.org/) and the general trend towards decoupling the view and data layers are here to stay.

I have been teaching [Craft CMS](https://craftcms.com/) as a database-driven CMS since it was first released. [Pixel & Tonic](https://pixelandtonic.com/) releasing [a native headless mode and a solid native GraphQL API](https://craftcms.com/blog/craft-33) only confirmed my choice.

[Jekyll](https://jekyllrb.com/), while very good at generating a site based on Markdown and static data files, requires either a [plugin](https://github.com/brockfanning/jekyll-get-json) or a [build process](https://twitter.com/philhawksworth/status/1159193504851144705) [in front of it](https://david.darn.es/tutorial/2019/08/11/use-ghost-with-jekyll/) to consume data from APIs or headless CMSes.

Students (and myself) also have to install and maintain a Ruby environment to be able to use it. [Eleventy](https://www.11ty.dev/) is built on Node, which is easier to install and maintain as a development environment. It also means that students can leverage their existing knowledge of Javascript.

## Extensibility

Working within a familiar environment and being able to extend and configure Eleventy using a language students already know and understand is a game changer.

Need custom [filters](https://www.11ty.dev/docs/filters/) or [shortcodes](https://www.11ty.dev/docs/shortcodes/)? Use Javascript. Create custom [order or filters for your collections](https://www.11ty.dev/docs/collections/) before using them in your templates? Same deal. Use NPM packages to help you build the functionalities your project needs? You're already in Node.

For students, this is invaluable. Granted, Eleventy might feel a bit closer to the metal compared to Jekyll but the increased flexibility, extensibility and familiarity is definitely worth it.

## Simplicity

With React, Vue or Svelte being all the rage these days, SSG like [Gatsby](https://www.gatsbyjs.org/) or [Gridsome](https://gridsome.org/) were also on my radar.

Personally, I feel that those solutions, while extremely valuable when you have to deal with app-like functionalities and / or state-based UI, come with a lot of bagage and are a bit overkill when building content-driven websites.

By comparison, Eleventy is a lot simpler and looks a lot less like a black box to me (if I am being completely honest). [Fetching data from a GraphQL API](/blog/headless-cms-graphql-api-eleventy/) is quite trivial and students can still use what they learned with my colleagues teaching them Vue or Node if the project requires it.

## Workshop course and sample website

All things considered, I am really happy with how the course went this year. Students seemed to enjoy it and got the hang of it pretty quickly.

My "[introduction to Eleventy](https://github.com/jeromecoupe/iad_eleventy_introduction)" course is available on Github in French and English, along with a [sample website](https://github.com/jeromecoupe/sample-11ty-blog) hosted on [Netlify](https://www.netlify.com/). Feel free to check both out and to give feedback, open issues or make pull requests if you think something could be improved.

As I have [said in the past](/blog/teaching-in-the-open-craft-jekyll-workshops/), teaching in the open is part of my attempt to stay relevant while teaching front-end design in this ever-moving, ever-changing messy web of ours.
