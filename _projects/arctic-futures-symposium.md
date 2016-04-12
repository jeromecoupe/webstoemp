---
title: "Arctic Futures Symposium"
date: 2014-07-15 00:00:00
excerpt: "Arctic Futures is an annual international symposium promoting dialog on Arctic-related issues. I was hired to develop a website and had just 3 weeks to design and build it from scratch. A relatively small project on a tight deadline."
project_url: http://www.arcticfutures.org
project_website: www.arcticfutures.org
project_tagline: "Event website on a deadline"
project_year: 2014
project_thumbnail: arcticfutures_thumb.jpg
project_image_small: arcticfutures_600.jpg
project_image_medium: arcticfutures_1024.jpg
project_image_large: arcticfutures_1500.jpg
categories:
- Web
tags:
- RWD
- Registration
- Mobile first
---

## Managing registrations

[Arctic Futures](http://www.arcticfutures.org) is a free symposium but, seats being available in limited numbers, the organisers wanted attendees to register prior to the symposium. I built a system allowing them to easily control whether registrations are open or closed: flicking a switch in the control panel triggers a few changes on the front end and activate or deactivate the registration form.

I worked with [Craft](http://www.buildwithcraft.com) as the Content Management System for the website and whipped together a small notification plugin that, combined with the [Guest Entries](https://github.com/pixelandtonic/GuestEntries) first party plugin, allowed me to create a modular registration form using email notifications in no time.

## An evolving schedule

The other important piece of that project was the symposium schedule. As anybody having organised such an event would know, the programme is in a constant state of flux until a few weeks before the event. Using Craft and [Matrix](https://buildwithcraft.com/features/matrix), I was able to build a highly modular tool allowing the client to add, delete and rearrange sessions or breaks to compose the programme. Using live preview, they can have a look at the full schedule before publishing it online.

Now, they can make the programme evolve until a few days before the event. When the programme is finalised, the graphical team has a sound basis for the printed version.

## A responsive mobile-first approach

People attending an event are very likely to use the website on a tablet or a phone during the conference or on their way to it. We made sure they would have the best possible experience.

On the technical side of things, I made the decision to use reponsive images with `srcset` and `sizes` combined with picturefill in production.
