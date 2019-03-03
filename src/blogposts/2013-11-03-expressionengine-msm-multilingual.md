---
title: "Using MSM for ExpressionEngine multilingual websites"
excerpt: "When developing mulilingual websites with ExpressionEngine, I would argue that (wait for it) the Multi-Sites Manager is one of the options you should consider, especially when dealing with content-heavy websites."
image: "expressionengine.jpg"
imageAlt: "Expressionengine logo"
tags:
- CMS
- ExpressionEngine
- Multilingual
---

There have been [many](http://eeinsider.com/articles/multi-language-solutions-for-expressionengine/) [talks](http://cwcrawley.co.uk/2010/01/multi-lingual-websites-in-expressionengine/), at [conferences](https://speakerdeck.com/stevieg_83/intro-to-multi-lingual-sites-in-expressionengine) and [elsewhere](http://www.slideshare.net/vinnyio/multilanguage-websites-in-expressionengine), about developing multilingual websites with [ExpressionEngine](http://ellislab.com/expressionengine/). Because of the very flexible nature of the CMS, multiple solutions are always mentioned:

- putting all languages in a single post, using custom fields, publish layouts and tabs to create manageable forms
- duplicating posts to cater for the various languages and using categories to display the correct posts on the front end.
- [several add-ons](http://devot-ee.com/search/results?keywords=languages&collection=addons&addon_version_support=ee2) have also been developed to help dealing with multilingual websites.

Seldom is the [Multi Sites Manager](http://ellislab.com/expressionengine/user-guide/cp/sites/index.html) (MSM) mentioned as an option. Throughout this article, I will go through the reasons why I think that MSM is one of the solutions to consider, particularly if you are dealing with content-heavy websites.

## Advantages

Building a multilingual site with MSM has multiple advantages, which I will try to summarize here. A few drawbacks will also be mentioned at the end of this article.

### Fits content workflows & easy to understand for users

In my experience, most medium and large-sized multilingual websites are managed by several editors, one of them usually being responsible for a linguistic version of the website or parts thereof. With those content-heavy websites, having content creators working in their mother tongue is crucial to ensure quality.

By having all the linguistic versions of a post glued together in one publish layout, you tend to enforce a workflow that does not correspond to the daily reality of your content editors, who will very rarely be responsible for all the linguistic versions of that post. In fact, the same problem occurs at a different level (edit screens and lists) if you are using distinct entries for your different languages. Users will still have to go through lists of posts where all languages are mixed.

Using MSM, each content editor is responsible for a site that is entirely in the language he or she masters. This helps to create a sense of entitlement and is a lot easier to understand for editors. It is also efficient than constantly having to go through content that are not in the language you are in charge of editing.

### Greater flexibility

At various levels, working with an MSM architecture creates a lot more flexibility both for the developers and the content creators.

#### Content, architecture, functions

For content creators, such an architecture allows people to publish content in a language without necessarily publishing it also in all the other languages of the website (local events, local resources, etc.).

As a developer it is certainly possible to allow for this with other setups (language specific custom fields or template groups), but working with different websites altogether greatly helps content publishers and reviewers to wrap their heads around the concept that the content they publish doesn't necessarily have to be published in all languages.

These days, the lifespan of a website will be around three or four years. Even if the linguistic versions were thought of as carbon copies of one another when the site was launched, this often changes over time. The client focuses on one language more than on the others, local needs arise and new sections or functions of the site have to be developed for one linguistic version only, etc.

When dealing with international websites, you might have to cater for linguistic versions reading from right to left, while other are being read from left to right. In that context, having independent websites, templates and template groups might be a bonus (charsets in templates, variations of general layout, etc.)

Having each linguistic versions as a separate site also makes it a lot easier for the developer to add or remove a language. Just delete an entire site or duplicate an existing one, change field labels, instructions and global variables (they are copied as well, even if you use more powerful add-ons like [Low Variables](http://devot-ee.com/add-ons/low-variables)) and you are ready to roll within a couple of hours. That can prove a lot more difficult to do with more entangled multilingual setups.

That being said, if you use a lot of custom fieldtypes like [Playa](http://devot-ee.com/add-ons/playa), [Matrix](http://devot-ee.com/add-ons/matrix) and [Assets](http://devot-ee.com/add-ons/assets), data duplication from site to site might not be as easy as I make it sound (more on that later).

#### SEO and URL structure

Wether you are using the default template group/templates URL schemes of ExpressionEngine or template routes, having separate websites for each of your languages makes it easier to have as much flexibility as possible as far as templates and template groups names are concerned, without resorting to hacks or [add-ons](http://devot-ee.com/add-ons/transcribe).

Creating a great multilingual experience in terms of SEO extends to your URL structure. Translating URLs in all languages is a lot easier to do in the framework of an MSM setup.

### Simplify your development

Having each linguistic version as a separate site allows you to take advantages of all the content holders available in expressionengine: channels, categories, snippets, embeds, variables, comments, etc.

Development is greatly simplified, since you do not have to jump over hurdles introduced by using other solutions, where your languages are mixed at various levels (entries, channels, variables, etc).

Using these data containers in a native way also spares you a lot of filtering at the template level.

Finally, since ExpressionEngine defaults to using the current site automatically as a parameter in all your tags and loops, you very seldom have to add it and change it for each site.

## MSM Woes

[Using MSM is not all nice and dandy](https://twitter.com/jacobrussell/status/245575758381207552). It sometimes feels like it's an afterthought, something that was bolted on the existing code base. The simple fact that it consists in several files to be added to the base software feels more like a third party add-on rather than a native functionality.

I also think it's safe to say that MSM is mainly geared towards having it powering several completely separate sites, rather than versions of a single website. For example, it makes sense in a multilingual MSM setup to share some of the user-uploaded assets like images and files between sites. Currently, that has to be done manually.

If you want to use the images of a gallery you just uploaded in the French version of your site and want to publish a version of the same gallery in the English version of your site, you first have to sync your upload location in the Control Panel for the English website to have those files available for use.

Configuration-wise, MSM is a little bit finicky. Getting your head around what needs to be in the various `index.php` files versus what needs to be in your main (and only) `config.php` file can prove to be difficult. While the big add-ons generally play nice with MSM, some add-ons do not.

Be aware that, if you use a lot of custom fieldtypes you might be in for some raw MySQL data transfer. While MSM can duplicate "regular" entries easily when copying a site, everything outside of the `channel_data` and `channel_titles` tables will not be copied from one site to the other.

Despite those shortcomings, I still think MSM is a solution to be considered when developping a multilingual website with ExpressionEngine. I hope the few points I have made in this article will at least get some of you to think about it for your next multilingual project.
