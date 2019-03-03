---
title: "Benefits of building your own front-end style guide"
excerpt: "In a world where you can download popular UI toolkits like Bootstrap or Foundation, what are the benefits of building your own front-end style guide, tailor-made to your needs?"
image: "toolset.jpg"
imageAlt: "Toolset - Photo by Cesar Carlevarino Aragon"
tags:
- Front-end
- Style guides
- Workflow
---

If the proliferation and popularity of UI toolkits like [Bootstrap](http://getbootstrap.com/) or [Foundation](http://foundation.zurb.com/) have taught us one thing, it's that [front-end styleguides are a thing](http://styleguides.io/) in modern front-end development.

These are popular because they solve common problems. Let's first examine which ones. I will then argue that, if you are going to live with a front-end codebase for a (relatively) long time and grow and evolve with it, you should probably consider creating your own front-end style guide and tailor it to your needs.

## The problems to be solved

In my opinion, the popularity of these tools is tightly related to the fact that they help solve important problems all front-enders are facing these days.

### Quick, iterative in-browser prototyping

The current front-end landscape calls for agile methods and quick iterations. With the proliferation of screen resolutions, screen sizes, devices and capabilities, the need for prototyping in the browser is increasing.

UI toolkits like Bootstrap or Foundation are turnkey products that are great at giving you a ready to use prototyping framework. If you have a front-end style guide and know it inside and out, creating prototypes quickly, evaluating them in the browser and iterating rapidly becomes a lot easier.

### Components-based approach

We don't build pages anymore, we build systems (of components). That sentence has been used so much it is now almost trite, but it remains true nonetheless. UI Toolkits like Bootstrap and Foundation take a very component-based and systematic approach. They mainly consists in a few high level tools (grids, typography, etc.) and utility classes, supplemented by a host of modules and variations of those modules. Concepts like scoping or the single responsibility principle are at work everywhere.

Such a modular approach to code is increasingly important in all areas of front-end, be it CSS, HTML or JS. That's a very strong trend in our line of work that extends to specifications currently being worked on. [Web Components](http://webcomponents.org/) and projects like [Polymer](https://www.polymer-project.org) are at the forefront of this trend.

### Teams &amp; documentation

Modern websites and applications are complex beasts requiring the collaboration of multiple people. Collaborating on a project over a long period of time is easier if you have good documentation in place. A well documented style-guide will help you bring new developer on board and generally speeds up your project by enforcing coding and naming conventions.

Documentation is one of the key aspects making those turnkey UI toolkits so popular. All of these toolkits are almost self-documented, meaning that the documentation itself is done within the product, using HTML, CSS, JS and the components and tools made available by the product itself. That's precisely why those toolkits, albeit created by highly skilled individuals and teams, can be used by people having a basic understanding of the underlying technologies and principles.

## Tabula rasa

My argument is not that UI toolkits like Bootstrap or Foundation are inherently evil or that you should never use them in production (although I have been known to say that over a beer sometimes). My point is that, if you are going to live with a project for a while to grow and maintain its codebase, or if you work with a team and want to enforce conventions and best practices, I would say you are better off creating your own front-end style guide.

In fact, al least two of the most popular of those UI frameworks began their life as internal style guides for either Twitter (Bootstrap) or Zurb (Foundation). You shouldn't ignore them. Instead, look at how they are made, how they solve common problems and what patterns they tackle. They can be a tremendous source of inspiration, you should look at them and -dare I say it- even steal from them from time to time.

### Master of your own destiny

By using an off the shelf UI toolkit, you are introducing a big dependency and you are agreeing to a lot of choices that were made for you. You are now essentially tied to a codebase you do not fully control. Although [migration](http://getbootstrap.com/migration/) [instructions](http://foundation3.zurb.com/migration.php) [exist](http://foundation.zurb.com/docs/upgrading.html), in my experience, UI toolkits are rarely updated during the lifetime of a project.

The ability to adapt over time can be business critical. Introducing such a dependency might hinder the ability of your codebase to evolve quickly enough.

By building your own style guide, you are in control of your codebase and of the dependencies and technologies you chose to use and commit to.

### Make your own choices

With an in-house style guide, you can make your own choices and decisions, based on your own business needs and on your team's experience and preferences.

You need to use different grid breakpoints or you want to use inline-block instead of floats? You can. Your design calls for a golden-ratio based grid? More power to you. Your team wants to use a BEM-inspired naming convention and classes like `.jumbotron` make no sense to you? Check. Performance and progressive enhancement are at the core of your project? Fine.

By essence, turnkey UI toolkits are built for the masses, are quite prescriptive and [focus on the how rather than on the why](https://speakerdeck.com/csswizardry/what-is-a-css-framework-anyway). When using them, you have to build around them for maximum efficiency and they are not very well suited to building bespoke codebases.

It might take you some time up front, but building something that is truly tailored to your business needs and those of your team will save you some time down the line.

If you build it in your approach from the get go, building an in-house stye guide is not going to add a lot of overhead to your project. That's just a sane approach to front-end development these days.

### Increase collaboration &amp; buy in

In my small experience, developing an internal front-end style guides is also an opportunity to involve stakeholders and gather people around a table. It's a fantastic communication tool and, used well, it can foster collaboration in your organisation.

If people in charge of design, development, UI/UX, content and business are all involved in the creation of your style guide, you are dramatically increasing its adoption rate compared to using a solution coming from the outside.

A style guide is also an investment in your team, which is always a good idea. Having everybody behind you when trying to get buy-in from the management changes the dynamic of those conversations.

### Stay lean

Front-end codebases have a tendency to put on weight over time and get more complex while we all strive for them to stay lean, understandable and maintainable.

All UI toolkits have migrated to a pre-processor architecture these days and including only the components you need is a possibility but, again, you have to know someone else's codebase and its dependencies tree quite well to only include what you need. In cases where the toolkit does not quite provide you with what you need, you will have to override certain things or to add your own components that might have to interact with certain elements of the toolkit. That will inevitably translate into a more fragile, more bloated and less manageable codebase.

All this can be avoided if you start with the basic tools and components you need and build up the tools and components you need to solve your own problems.

## Famous last words

Let me reiterate once again, tools like Bootstrap or Foundation are not evil per se. They make a lot of sense when building quick prototypes and can teach us a lot in terms of documentation, pattern identification and problem solving. One could even argue they make total sense for small projects or when budgets are tight.

My basic argument is that they might not be the best choices for bespoke projects having specific needs. If you are going to live with a codebase for a while and evolve and grow with it, you are better off rolling your own. Standing on the shoulders of giants here: [Mark D Otto](https://speakerdeck.com/mdo/build-your-own-bootstrap) and "Web Standards Southern Gentleman" [Dave Rupert](http://daverupert.com/2013/04/responsive-deliverables/) are basically saying the same thing.
