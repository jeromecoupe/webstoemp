---
title: "StepStone"
date: 2017-04-15 00:00:00
excerpt: "StepStone’s internal design team wanted their different products to be consistent with one another. I collaborated with the team at Central to build a front-end pattern library for them."
project_url: https://www.stepstone.be
project_website: www.stepstone.be
project_tagline: "Building a front-end pattern library"
project_thumbnail: stepstone_thumb.jpg
project_image_small: stepstone_600.jpg
project_image_medium: stepstone_1024.jpg
project_image_large: stepstone_1500.jpg
categories:
- Web
tags:
- Design systems
- Pattern library
- Jekyll
- NPM
---

## A design system in code

[Central](https://central.team) started the project by making an audit of all the major UI patterns and components used in the various online products. We then worked with StepStone's design team to define a narrow set of components that would allow them to build 95% of the views they needed.

The next step was to create a responsive library of components using HTML, (S)CSS and JS. Each component is fully functional, includes states, animations and interactions and is thoroughly documented. The pattern library is hosted on Github and can easily be maintained and augmented by the whole team.

Having all the commonly used components available in code allowed StepStone’s internal design team to increase the visual consistency between the various products they are working on. It also helps reducing the delta between what is designed and what is implemented in production.

## A prototyping tool using open source technologies

Using [Jekyll](https://jekyllrb.com/), [NPM](https://www.npmjs.com/) and [Gulp](https://gulpjs.com/), we built a prototyping environment that dynamically loads StepStone’s component library.

With that environment in place, designers can painlessly create templates for commonly used layouts and quickly build fully responsive views using components from the pattern library. Designers and developers can now focus more of their time on new components and hard to crack problems rather than starting fgrom scratch with every new project.

Since Jekyll handles JSON files out of the box, prototyping in code with real data becomes trivial. Using very simple logic and static dictionaries, the team can also test their designs in multiple languages, just by changing a single global variable.
