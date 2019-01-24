---
title: "ABVV-FGTB"
date: 2018-07-15 00:00:00
excerpt: "ABVV/FGTB was looking for someone to build a front-end components library for one of their clients developing a web application. I worked on the project as part of a Cronos team for a couple of months."
project_url:
project_website:
project_tagline: "A front-end components library"
project_thumbnail: fgtbabvv_thumb.jpg
project_image_small: fgtbabvv_600.jpg
project_image_medium: fgtbabvv_1024.jpg
project_image_large: fgtbabvv_1500.jpg
categories:
- Web
tags:
- Nunjucks
- Jamstack
---

## Building a components library

[Leap Forward](https://www.leapforward.be/) is a design and innovation group based in Gent. Their client, the [FGTB](http://www.fgtb.be/)/[ABVV](http://www.abvv.be/) belgian union, was busy porting an old AS/400 application to a modern web application. The mission was to convert the design of the new application into a framework-agnostic pattern library that could scale, be highly maintainable and that could be distributed as an NPM package.

I worked on site to convert the design into a set of components and utility classes. Components are responsive, self contained and each of them is configurable with Sass maps and variables where it makes sense. Both components and utility classes make use of centralised variables for general configuration items like breakpoints, colors and spacing.

## Making it distributable

The other half of the work was to hand off this components library to the Angular team building the application and fix the occasional bug that would arise as components would be implemented.

The components library is built as a static application using a combination of NPM scripts, Webpack and Gulp as build tools. Coding standards were set and enforced via linters for Sass code and UI-related modern JavaScript. The code then gets distributed as an NPM package using the client's own Nexus server.

## Between design and development

I really enjoy projects at the intersection of design and development. Working with visual designers on one end and front-end engineers on the other is something I truly love, partly because I can have one foot in each world and help streamline the project. I also get to tinker a lot with build tools to create simple but efficient workflows that are completely independent from any JavaScript front-end framework, which I also find quite liberating.

I have seen a lot of interest for "design ops" lately and it felt great to get involved with it. Working on such an IT-driven project in a big organisation and with a great team was also very interesting and a big change from the medium sized projects I usually work on.
