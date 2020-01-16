---
title: "Teaching in the open: Eleventy"
excerpt: "As part of my teaching duties, I have to introduce students to structured content and data. Since the course was created, I decided to talk about both a database driven CMS and a Static Site Generator. This year, I replaced Jekyll with Eleventy as the SSG I teach."
image: "eleventy-possum.jpg"
imageAlt: ""
tags:
  - Eleventy
  - 11ty
  - Jamstack
---

As a teacher, the last thing you want is to be outdated. Not keeping up with the trends is akin to a capital offense. Students being the demanding lot that they are will let you know very quickly if they have the slightest impression you are not teaching them relevant skills or technologies.

I firmly believe the [Jamstack movement](https://jamstack.org/) and the general trend towards decoupling the view and data layers are here to stay.

## Decoupling the data layer

I have been teaching [Craft CMS](https://craftcms.com/) as a database-driven CMS since it was released. Since [Pixel & Tonic](https://pixelandtonic.com/) added a native headless mode and a solid native GraphQL API, I am even more confident in teaching it for another five years.

[Jekyll](https://jekyllrb.com/) however, while very good at generating a site based on Markdown and static data files, requires either a [plugin](https://github.com/brockfanning/jekyll-get-json) or a [build process](https://twitter.com/philhawksworth/status/1159193504851144705) [in front of it](https://david.darn.es/tutorial/2019/08/11/use-ghost-with-jekyll/) to consume data from APIs or headless CMSes. It also requires that students install a Ruby environment to be able to use it on their machines.

By contrast, [Eleventy](https://www.11ty.dev/) is built on Node, which is both a lot easier to install and maintain as a development environment. That also means that students can leverage their existing knowledge of Javascript.

## Node ecosystem and extensibility

Working within a familiar environment and being able to extend and configure Eleventy using a language students already know and understand is trly a game changer.

Need custom [filters](https://www.11ty.dev/docs/filters/) or [shortcodes](https://www.11ty.dev/docs/shortcodes/) ? Use Javascript. [Ordering or filtering your data](https://www.11ty.dev/docs/collections/) before using it within your templates ? Same deal. Want to use NPM packages to help you build the functionalities your project needs ? You're already in Node.

That's a big plus for all front-enders and, for students, it is truly invaluable.

Granted, Eleventy might feel a bit closer to the metal compared to Jekyll but the increased flexibility, extensibility and familiarity is definitely worth it.

## Elephants in the room: framework-based Static Site Generators

With React, Vue or Svelte being all the rage these days, SSG like [Gatsby](https://www.gatsbyjs.org/) or [Gridsome](https://gridsome.org/) were also on my radar.

Personally, I feel that those solutions, while extremely valuable when you have to deal with app-like functionlities and / or state-based UI, come with a lot of bagage and are a bit overkill when building content-driven websites.

By comparaison, Eleventy is a lot simpler and looks a lot less like a black box to me (if I am being completely honest). Fetching data from a GraphQL API is quite trivial and nothing prevents you from sprinkling a little Vue on top if the project requires it. Students can still use what they learned with my colleagues teaching them Vue or Node.

## Teaching in the open: workshop course and sample website

All things considered, the course went really well this year and students seemed to enjoy it and got a hang of it pretty quickly.

I have translated the course to English and [posted it on Github](https://github.com/jeromecoupe/iad_eleventy_introduction) along with a [sample website](https://github.com/jeromecoupe/sample-11ty-blog) hosted on Netlify. Feel free to check both out and to send me feedback, open issues or make pull requests if you think something could be improved.

As I have said in the past, teaching in the open is part of my attempt at staying relevant while teaching front-end and design in this ever-moving, ever-changing, messy web of ours.
