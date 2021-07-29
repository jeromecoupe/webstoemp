---
title: "Structuring Eleventy projects"
excerpt: "One of the great things about Eleventy is that it gives you a lot of freedom in terms of organizing your code. However, for my own sanity, I needed a standardized project architecture that made sense to me."
image: "construction.jpg"
imageAlt: "Building under construction and cranes - Photo by Danist on Unsplash"
tags:
  - Front-end
  - Eleventy
  - 11ty
---

Coupled with my lack of personal conventions regarding project structure, the un-opinionated nature of Eleventy meant that all my projects were organized slightly differently. As a result, I lost some time figuring out how things were configured and organized when jumping from one project to another, and reusing code from project to project was also made more difficult.

In short, it was time for a minimal amount of structure and conventions. Here is what I came up with:

## Files and folders

```txt
project_root/
+-- build_tasks/
+-- src/
  +-- _11ty/
    +-- collections/
    +-- filters/
    +-- shortcodes/
    +-- utils/
  +-- _data/
  +-- _includes/
    +-- layouts/
    +-- macros/
    +-- partials/
    +-- svg/
  +-- assets/
    +-- fonts/
    +-- img/
    +-- js/
    +-- scss/
  +-- content/
    +-- en/
    +-- fr/
  +-- .eleventy.js
  +-- .gitignore
  +-- .package-lock.json
  +-- .package.json
  +-- README.md
```

- `build_tasks`: I generally use NPM scripts as a build pipeline. Occasionally, I need something more than a package and a one liner. Those slightly more involved build scripts go in this directory.
- `src/_11ty`: contains everything required by the `.eleventy.js` config file: collections, filters, shortcodes and utilities all go in their own directories. Reusing these in another project amounts to copying a file, installing dependencies if needed and requiring the file in `.eleventy.js`.
- `src/_data`: data directory containing static or dynamic local data files. Pretty much standard in Eleventy projects.
- `src/_includes`: I generally use Nunjucks extensively, along with [template inheritance](https://mozilla.github.io/nunjucks/templating.html#extends) and `extends`, which means layouts, includes and macros must live in that directory.
- `src/_includes/layouts`: layouts used by the project. I tend to use Nunjucks template inheritance whenever possible. The ability to use [blocks](https://mozilla.github.io/nunjucks/templating.html#block) makes it a superior layout system for me compared to the (simpler) Eleventy layout system.
- `src/_includes/partials`: contains components that do not require any parameters other than those available in the global template context. Used for things like header, footer and SVGs.
- `src/_includes/macros`: contains Nunjucks macros. Macros are locally scoped and allow for parameters to be passed to them. Used for standard components (cards, etc) and utilities (dates formatting).
- `src/_includes/svg`: SVG code to be included inline in pages. SVG are optimized and [made accessible](https://css-tricks.com/accessible-svgs/).
- `src/assets`: static and processed assets. Typically contains `scss`, `img`, `fonts` and `js` directories. Most of these are handled by a build process, while others, like `fonts` are copied by 11ty.
- `src/content`: the content of the site, be it Nunjucks or Markdown files. I generally make heavy use of directories and `getFilteredByGlob(Glob)` to define collections, rather than using tags. For [multilingual projects](/blog/multilingual-sites-eleventy/), I create subfolders containing directory data files to define locales as direct children of the `content` folder.

I am sure these conventions I have set for myself will still evolve (escaping entropy is an illusion) but, so far, this way of loosely structuring projects makes sense to me and allows me to be more productive.