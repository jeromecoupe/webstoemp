---
title: "Contextual components with Craft CMS"
excerpt: "Front-end developers gravitate more and more towards using components these days. Here is a simple approach to reuse the logic of a component in Craft CMS while adjusting its styling depending on context."
image: "components.jpg"
imageAlt: "Wood blocks - Photo by Marcello Gennari"
tags:
- Craft
- Twig
---

As developers, we always want to be as lean as possible and not repeat ourselves. As a flexible CMS, Craft lends itself very well to a component based approach. Basically, whenever I am reusing the same views in a website, I create a component handling the display of it so I can have a single source of truth and manage everything in a centralised way.

## Simple component

A very simple example of this approach would be a blog where you have a simple card element displaying the main elements of a blogpost and a link to the detail page. This kind of element will be used on your homepage, on your archive page and, for example, on your related blog posts section in your detail page.

Here is what it might look like:

```twig
{% raw %}{# get all Blogposts #}
{% set latestBlogposts = craft.entries()
      .section("blog")
      .orderBy("postDate desc")
      .limit(3)
      .all() %}

{# display blogposts #}
{% for item in latestBlogposts %}
  {% if loop.first %}<ul>{% endif %}

    <li>
      <article class="c-blogpost">
        {% set image = item.blogpostImage.one() %}
        {% if image %}
          <img class="c-blogpost__image" src="{{ image.url({ mode: 'crop', width: 300, height: 225, position: 'center center' }) }}" alt="{{ image.title }}">
        {% endif %}
        <p class="c-blogpost__meta"><time datetime="{{ item.postDate|date('Y-m-d') }}">{{ item.postDate|date('d F, Y') }}</time></p>
        <h2 class="c-blogpost__title"><a href="{{ item.url }}">{{ item.blogpostTitle }}</a></h2>
        <p>{{ item.blogpostIntro }}</p>
      </article>
    </li>

  {% if loop.last %}</ul>{% endif %}
{% else %}
  <p>No blogpost found</p>
{% endfor %}{% endraw %}
```

If you work like this, you will need to repeat that little `blogpost` view everywhere you use it, which flies in the face of the DRY principle. A better option is to use an include and pass it the object you want to display.

Using a component-based approach, our code becomes:

```twig
{% raw %}{# get all Blogposts #}
{% set latestBlogposts = craft.entries()
    .section("blog")
    .orderBy("postDate desc")
    .limit(3)
    .all() %}

{# display blogposts #}
{% for item in latestBlogposts %}
  {% if loop.first %}<ul>{% endif %}

    <li>
      {% include "_components/blogpost.twig" with {
        blogpost: item
      } only %}
    </li>

  {% if loop.last %}</ul>{% endif %}
{% else %}
  <p>No blogpost found</p>
{% endfor %}{% endraw %}
```

Adding the `only` keywords means that this component will only get the variables that you are passing to it and will not inherit all the variables available in the context of other templates in the inheritance stack.

Then, you can simply create a component in your newly created `templates/_components` folder.

```twig
{% raw %}{#
  Blogposts
  Displays basic information about a blogpost

  @param EntryModel   blogpost
#}

{# Parameters #}
{% set blogpost = blogpost ?? null %}

{# transforms #}
{% set thumbnail = {
  mode: 'crop',
  width: 300,
  height: 225,
  position: 'center center'
}%}

{# macros #}
{% import "_macros/date-helpers as datehelpers %}

{# view #}
<article class="c-blogpost">
  {% set image = blogpost.blogpostImage.one() %}
  {% if image %}
    <img class="c-blogpost__image" src="{{ image.url(thumbnail) }}" alt="{{ image.title }}">
  {% endif %}
  <p class="c-blogpost__meta"><time datetime="{{ datehelpers.dateMachine(blogpost.postDate) }}">{{ datehelpers.dateLong(blogpost.postDate) }}</time></p>
  <h2 class="c-blogpost__title"><a href="{{ blogpost.url }}">{{ blogpost.blogpostTitle }}</a></h2>
  <p>{{ blogpost.blogpostIntro }}</p>
</article>{% endraw %}
```

That way, you can always load the same component template whenever you need to display a blogpost card, be it on the homepage, on your blog archive page or in your related blogposts section in your detail page.

We have less code repetition and can reference a single source of truth, which makes our code more consistent.

## Contextual components

Lately, I have been starting to use this approach to build components that share the same logic but are styled differently depending on context.

A good example of this is a navigation interface. Maybe you need to display your main navigation in your main navigation bar, in a separate mobile menu and in your footer. The logic and elements to display are the same but your styling is different.

Time for a contextual `mainnav.twig` component that we will again write in our `templates/_components` folder.

```twig
{% raw %}{#
 # Mainnav
 # Displays main navigation based on entries in a structure section
 #
 # @param String       context
 # @param EntryModel   entry
 # @param EntryModel   currentSection
#}

{# Parameters #}
{% set context = context ?? null %}

{# set block class #}
{% switch context %}
  {% case "footer" %}
    {% set blockClass = "c-footernav" %}
  {% case "mobilemenu" %}
    {% set blockClass = "c-mobilenav" %}
  {% default %}
    {% set blockClass = "c-mainnav" %}
{% endswitch %}

{# set element classes #}
{% set itemClass = blockClass ~ "__item" %}
{% set linkClass = blockClass ~ "__link" %}

{# set active class #}
{% set activeClass = "is-active" %}

{# loop through entries #}
{% set navEntries = craft.entries()
    .section('mainnav')
    .all() %}
{% for navEntry in navEntries %}
  {% if loop.first %}<ul class="{{ blockClass }}">{% endif %}

    {# set label #}
    {% set label = navEntry.mainnavLabel|capitalize %}

    {# set linked entry (entry field) #}
    {% set linkedEntry = navEntry.mainnavEntry.one() %}

    {#
      # set currentEntry and class
      # - by default currentEntry is set to the currently displayed entry
      # - can be overridden by a currentSection variable set at the template level and pointing to an entry in a single section
      #}
    {% set currentEntry = (currentSection is defined) ? currentSection : entry %}
    {% set currentClass = (linkedEntry.id == currentEntry.id) ? activeClass %}

    {# display list item #}
    <li class="{{ itemClass }}"><a href="{{ linkedEntry.getUrl() }}" class="{{ linkClass }}  {{ currentClass }}">{{ label }}</a></li>

  {% if loop.last %}</ul>{% endif %}
{% endfor %}{% endraw %}
```

We can then simply call our component in our footer and pass it a context like so:

```twig
{% raw %}{% include "_components/mainnav.twig" with {
  context: "footer"
}%}{% endraw %}
```

We don't use the `only` keyword here because we need more than our `context` variable. In this case we need `entry` and possibly `currentSection` to be available from the global context.

Again, our main navigation is handled by a single reusable component that gets styled differently based on the context variable we pass to it.

Personally, using a component-based approach helps me be more productive but, above all, it makes the sites I work on easier to debug and maintain over time.
