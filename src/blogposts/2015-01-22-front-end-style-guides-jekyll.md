---
title: "Building front-end style guides with Jekyll"
excerpt: "Style guides are a great tool to present responsive design systems. More often than not, I use Jekyll to produce HTML/CSS/JS prototypes these days. Here is my current approach to quickly create style guides for clients with Jekyll."
image: "design-blocks.jpg"
imageAlt: "Design Blocks - Photo by Sharon McCutcheon"
tags:
- Front-end
- Jekyll
- Style Guides
- Liquid
---

## Style guides and prototypes

Since the advent of the multi-platform web and responsive web design, I try to move to code as quickly as possible. I find it easier to demonstrate the responsiveness of my designs, CSS animations and other light interactivity in the browser.

While I don't go as far as working with a full on [atomic design approach](http://bradfrost.com/blog/post/atomic-web-design/), I am in favour of presenting clients with a design system rather than with full comps during the exploratory phases of a project.

Tools like [visual inventories](http://danielmall.com/articles/visual-inventory/), [style tiles](http://styletil.es/) and [elements collages](http://danielmall.com/articles/rif-element-collages/) are modular approaches I use during the [design process](http://vimeo.com/45915667). I usually complement those deliverables by [a style guide](http://styleguides.io/) or [pattern portfolio](http://clearleft.com/thinks/onpatternportfolios/) presenting the various building blocks of the design system in actual HTML/CSS/JS code.

## Why Jekyll makes sense for me

As front-end developers, our toolset has become relatively complex. For most projects, I will use and configure quite a few moving parts (Gulp, Bower, Sass, Git, CMS, Servers, etc.). During the design phase, I tend to favour a leaner toolset.

[Jekyll](http://jekyllrb.com/) fits the bill for me in that regard. It is simple to configure, use and version control and offers the basic functionalities I need without getting in the way: native Sass compilation, a simple but powerful templating language, an easy way to manage includes and layouts, etc.

## Jekyll boilerplate for style guides

I currently use a very simple Jekyll boilerplate ([available on Github](https://github.com/jeromecoupe/jekyllstyleguide)). It revolves around a simple collection called `_components` for which I set the output to `false` in the `_config.yml` file. Each component is simply an HTML file in that directory.

The YAML front matter for each of those files contains:

- the title of the component
- a link to the sass file for that component
- a type variable that we will use to filter or group components by type (more on that later)

In the `_include` folder I have a single file called `component.html` which contains the code to display components. Using an include is just a way to be DRY when using the display code multiple times. That include basically displays the code of the component twice:

- once to create the display view of the component
- a second time between `{% raw %}{% highlight %}{% endraw %}` and `{% raw %}{% endhighlight %}{% endraw %}` tags to create the code view

### Option 1: a very simple style guide

A very common option for displaying a style guide is to present it as a single page listing all your components. That's the approach favoured by [Code for America](http://codeforamerica.clearleft.com/) for example. It's easily taken care of using a simple `{% raw %}{% for %}{% endraw %}` loop.

```liquid{% raw %}
{% assign entries = site.components %}
{% for entry in entries %}
  {% include component.html %}
{% endfor %}{% endraw %}
```

Alternatively, you can group your components by type using a straightforward `group_by` filter:

```liquid
{% raw %}
{% assign componentsByType = site.components | group_by:"type" %}
{% for type in componentsByType %}
  <h3 class="sg-h2">{{ type.name | capitalize }}</h3>
    {% for entry in type.items %}
      {% include component.html %}
    {% endfor %}
{% endfor %}{% endraw %}
```

### Option 2: a more complex style guide

Some style guides, like [Rizzo from Lonely Planet](http://rizzo.lonelyplanet.com/styleguide/design-elements/colours), use a more detailed structure, with one page per component type and a navigation interface to navigate from page to page. You can easily use pages and [a simple data file to create the navigation](http://www.tournemille.com/blog/How-to-create-data-driven-navigation-in-Jekyll/).

The only thing left to do is include all components belonging to one type on the corresponding page. That's where the `type` variable in each of our components YAML Front Matter combined with the `where` filter come in handy. On the buttons page for example, you will just have to add:

```liquid
{% raw %}{% assign entries = site.components | where:"type","buttons" %}
{% for entry in entries %}
  {% include component.html %}
{% endfor %}{% endraw %}
```

I really like the simplicity and flexibility of Jekyll to create style guides. What tool do you use ?
