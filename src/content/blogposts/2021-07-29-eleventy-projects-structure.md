---
title: "Structuring Eleventy projects"
excerpt: "One of the great things about Eleventy is its flexibility and its lack of assumptions about how your projects should be organized. However, in order to preserve my own sanity, I needed to come up with a default files and folders architecture that made sense to me."
image: "construction.jpg"
imageAlt: "Building under construction and cranes - Photo by Danist on Unsplash"
tags:
  - Front-end
  - Eleventy
  - 11ty
---

Coupled with my lack of personal conventions regarding projects architecture, the unopinionated nature of Eleventy meant that all my projects were organized slightly differently. As a result, I lost some time figuring out how things were configured and organized when jumping from one project to another. Reusing code from project to project was also made more difficult.

In short, it was time for a minimal amount of structure and conventions. Here is what I came up with:

## Files and folders

```txt
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

- `build_tasks`: I generally use NPM scripts as my [asset pipeline](https://mxb.dev/blog/eleventy-asset-pipeline/). Occasionally, I need something more than an NPM package and a one liner. Those slightly more involved build scripts live in this directory.
- `src/_11ty`: contains everything required by the `.eleventy.js` config file: collections, filters, shortcodes and utilities all go in their own directories. Reusing these in another project amounts to copying a file, installing dependencies if needed and requiring the file in `.eleventy.js`.
- `src/_data`: data directory containing static or dynamic local data files. Pretty much standard in Eleventy projects.
- `src/_includes`: I use Nunjucks extensively, along with [template inheritance](https://mozilla.github.io/nunjucks/templating.html#extends) and `extends`, which means layouts, includes and macros must live in this directory.
- `src/_includes/layouts`: layouts used by the project. I use Nunjucks template inheritance whenever possible. [Blocks](https://mozilla.github.io/nunjucks/templating.html#block) makes it a superior layout system for me compared to the (simpler) Eleventy layout system.
- `src/_includes/partials`: components that do not require any parameters other than those available in the global template context. Used for things like header, footer and SVGs.
- `src/_includes/macros`: Nunjucks macros are locally scoped and accept parameters / arguments. Used for standard components (cards, etc) and utilities (formatting dates, etc.).
- `src/_includes/svg`: SVG code to be included inline in pages. SVG are optimized and [accessible](https://css-tricks.com/accessible-svgs/).
- `src/assets`: static and processed assets. Typically contains `scss`, `img`, `fonts` and `js` directories. Most of these are handled by a build process, while others, like `fonts` are copied by 11ty.
- `src/content`: the content of the site, be it Nunjucks or Markdown files. I generally use directories and `getFilteredByGlob(Glob)` to define collections, rather than using tags. For [multilingual projects](/blog/multilingual-sites-eleventy/), I create subdirectories containing [directory data files](https://www.11ty.dev/docs/data-template-dir/) to define locales as direct children of the `content` directory.

I am sure these conventions I have set for myself will still evolve (escaping entropy is an illusion) but, so far, this way of loosely structuring projects makes sense to me and allows me to be more productive.