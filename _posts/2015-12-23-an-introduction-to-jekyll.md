---
title: "Teaching Jekyll: static site generators as front end tools"
excerpt: "Static sites generators have become a part of the front end toolbox I use on a daily basis. When I was offered the opportunity to give a Jekyll workshop at school, I jumped on the occasion."
categories:
- Front-end
tags:
- grids
- sass
- css
---

## Why static site generators?

Out of curiosity, I have started tinkering with [Jekyll](http://jekyllrb.com) and [Metalsmith](http://www.metalsmith.io/) a couple of years ago. Today, Jekyll in particular has become a tool I use for client projects in various ways:

- It enables me to quickly set up a development environment and to iterate on code prototypes and templates. Coupled with Github pages, it allows me to make them available to clients for review and discussion.
- Jekyll (or [any other Static Site Generator](https://www.staticgen.com/)) is also a powerful tool to create project deliverables like [style guides or pattern libraries](http://styleguides.io/).

The "static ecosystem" has also matured quite a lot and a series of "[Content As A Service](https://www.contentful.com/)" or [Content](http://cloudcannon.com/) [Management](https://github.com/netlify/netlify-cms) tools are becoming available for static sites generators. These allow you to build static websites that can easily be maintained by non technical users.

## Structure of the course

As part of the courses I teach, there is a series of one day workshops for which I can pretty much choose the topics I want to cover. When students asked me if I could show them how Jekyll worked, I dedicated one of these one day workshops to it.

The structure of the course is as straightforward as can be (at least I hope so). It is divided in three chapters:

- **Setup and main concepts**: installation guide and main commands followed by core concepts and an overview of the folders and files structure of a default Jekyll install.
- **Create your data structure**: pages, collections, data files and YAML Front Matter variables are the main tools Jekyll gives us to create complex data structures. Combined with tags and categories, they form a very flexible system that can address most of your needs.
- **Liquid and templating**: Use the [Liquid templating engine](https://github.com/shopify/liquid/wiki/Liquid-for-Designers) to retrieve, manipulate and output your data. We dive head first into includes and layouts, control structures, loops and filters.

## Available on Github

I published the course [on Github](https://github.com/jeromecoupe/iad_jekyll_introduction) in [French](https://github.com/jeromecoupe/iad_jekyll_introduction/blob/master/jekyll_introduction_fr.md) and [English](https://github.com/jeromecoupe/iad_jekyll_introduction/blob/master/jekyll_introduction_en.md) in the hope that it can be useful to others. I will do my best to keep it up to date with new versions and features of Jekyll.

Don't hesitate to give me feedback, report issues or submit pull requests.
