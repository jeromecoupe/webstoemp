---
title: "To hell with abstract prescriptive deliverables"
excerpt: "As we reach the end of the year, it's time for good resolutions: one of mine is to ditch prescriptive and abstract deliverables created in isolation in favour of more descriptive, collaborative and concrete ones."
image: "to-hell.jpg"
imageAlt: "Animal Skull - Photo by Annie Spratt"
tags:
- Work
- Front-end
- Process
---

## Aiming for conversations

In my opinion, high fidelity deliverables like very detailed wireframes or comps are too much of an abstraction compared to the final product. I prefer deliverables that create ongoing conversations and aim at materialising the core aspects of a project quickly and in a concrete way, while leaving the door open for interpretation and evolution.

Deliverables are a mean to an end. They only exist for people and processes to align in order to create the real thing: the final product (or a prototype thereof in the pre-production phase).

Spending inordinate amounts of time polishing wireframes, static comps, content spreadsheets, personas and user journeys can be frustrating. Typically, these deliverables are also created in isolation and do not really foster collaboration. They often are very prescriptive, leaving little room for change or interpretation and locking the project in too rigid of a process. Because we spend so much time making them, we also get more attached and, as a result, we are less inclined to iterate and change them.

## Tackling strategy with a discovery workshop

In 2016, I have started all my projects with a discovery workshop. It helped. A lot. One day with clients and stakeholders is generally enough, but it can be extended if the scope warrants it. The goal here is to have conversations and gather insights in a very hands-on and collaborative way to produce the following:

- needs and business objectives for each identified user group
- first pass at information architecture
- content and data structure of key pages
- design brief and general design direction

### User groups, needs and objectives

We try to focus on three or four audiences, for each of them we want to come up with a persona that we try to define in a very practical way, using a job to be done approach.

For each audience, we have to come up with a couple of sentences with the following structure:

<blockquote>
  <p>When I <em>[something]</em>, I want to <em>[something]</em> so I can <em>[something]</em></p>
</blockquote>

For example, if we are working for an advertising agency, a user might say:

<blockquote>
  <p>When I browse different websites to choose an agency, I want to find a clear process and detailed case studies where that process is applied, so I can tell if the agency is a good fit for my project.</p>
</blockquote>

We then take the reverse approach and try to come up with objectives we have towards each of the defined audiences. Again, we take a very hands on approach using a simple construct.

<blockquote>
  <p><em>[verb]</em> <em>[user groups]</em> to <em>[something]</em> instead of <em>[something]</em> because <em>[something]</em></p>
</blockquote>

For example, working for a data visualisation company:

<blockquote>
  <p>Reassure companies with big data needs that they can choose us instead of the big players because we will adapt to their needs instead of shoehorning them into our processes, we don't lock them in with proprietary formats and we have years of experience in the field.</p>
</blockquote>

In my experience, those sentences and the discussions surrounding them will give you far more insight than detailed personas and user journeys. They are also more concrete and can serve as a guide for the duration of the project.

### Content and data structure for key pages and item types

We can then examine key pages and item types for the project at hand. The goal here is first to list all key pages and item types. For each of them, we want to have a precise data structure describing what chunks of content they contain. We want to be as granular as possible and establish priorities.

Talking about it in a mobile context generally helps avoiding the "everything is of equal importance" syndrome. A 300 pixels wide "tube of content" is a great construct to force people to prioritise, be it at the macro level (screens), or at the micro level (content types).

Everybody around the table can have their say about what should be included. We then collectively vote to establish what the most important items are for each page or content type.

### First pass at information architecture

Time to get post-it notes out. The goal is to collaboratively come up with a sensible information architecture by sticking post-it notes representing content types and key pages on the wall and moving them around. When there are hesitations, we just snap a picture of the various possibilities.

After the workshop, we test the information architecture or the various possibilities we came up with users, using something like [Treejack](https://www.optimalworkshop.com/treejack/) or tasks based exercises.

What we have produced has been created collaboratively, we had conversations and exchanges to come up with solutions to concrete problems. We have been precise enough to be able to build something, but loose enough to be fast and to be open to iteration.

### Get a design brief by reviewing existing examples

To gain insights into how a website should look like and work, I generally use a method that Dan Mall calls "[Visual Inventories](http://danielmall.com/articles/visual-inventory/)".

It is a very simple approach consisting in presenting the participants with 15 different existing designs that we put in context using short descriptive sentences. We are asking them if the presented approach would work for their project.

Everyone only has 15 seconds to rate each design on a scale ranging from 1 to 5. We then tally up the results and discuss the top three design approaches and why people think they would work. We also discuss the bottom three and why people think these approaches would not work for the project at hand. Take notes.

We now have a collectively built design brief. We can feed designers data that they can then interpret to create an element collage for the project.

## Build a clickable content prototype

The next step is to use all the data collected during the workshop to create the kind of clickable content prototype [described by Thomas Byttebier in his excellent post](http://thomasbyttebier.be/blog/the-bold-beauty-of-content-prototypes). The goal here is to create something tangible and testable that will bring together the insights gathered during the discovery workshop in terms of content and strategy.

Having something concrete to look at will spawn other conversations. Using tools like [Jekyll](http://jekyllrb.com/) and [Github pages](https://pages.github.com), that content prototype can be tweaked, revised and tested with users in quick iterative rounds, until we have something solid.

## Element collages as design deliverables

To tackle the visual design aspect of things, we need another deliverable alongside the content prototype. The inevitable Dan Mall has a fantastic post about what he calls "[element collages](http://danielmall.com/articles/rif-element-collages/)".

Using Sketch or Photoshop, we can quickly create an advanced moodboard of sorts that will allow designers to showcase what the website will look like and how certain parts of it will function, without having to paint pretty pictures of all the pages in the site.

Even though we are headed towards 2017, I still see web designers starting their explorations with desktop layouts. Element collages nudge designers into taking a more component-based approach and to leave the tyranny of the desktop page behind. Designing in the form of element collages is also an opportunity to focus on specific design challenges like complex responsive navigation, views of components at various screen sizes, etc.

Again, because of its moodboard-esque nature, an element collage is far less prescriptive than static comps. It is a more dynamic artefact, one that allows for design conversations to happen and avoids the proverbial "Don Draper big reveal".

## Enrich and iterate

Once the "Elements Collage" has been approved, we can slowly integrate visual design in our content prototype: typography, colors, icons, images, videos and, finally, layout.

The client does not have "paintings of a website" to compare the front-end implementation to. The front-end team can come up with its own interpretation of the design and collaborate with designers on the product directly, solving problems as they arise.

Front-end developers are not considered as simple "integrators" but can [interpret or shape the design](https://www.youtube.com/watch?v=ldx4ZFxMEeo) of the website or app they are working on. In the words of [Harry Roberts](http://csswizardry.com/): "designs are a clue, a blueprint, not a contract."

## Go forth and deliver

I don't pretend to have all the answers. I just know that moving to deliverables that are leaner, more concrete and produced collaboratively while spawning conversations is something I'll strive for in 2017.
