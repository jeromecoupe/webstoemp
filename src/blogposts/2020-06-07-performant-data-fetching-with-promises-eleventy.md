---
title: "Performant data fetching with promises and Eleventy"
excerpt: "Fetching a whole bunch of data from APIs at build time can be an intensive process. Getting that data in a performant way and caching it locally is an important part of Jamstack projects."
image: "dogs-fetching.jpg"
imageAlt: "Two dogs swimming back after fetching"
tags:
  - Eleventy
  - 11ty
  - Jamstack
  - Promises
---

## Do not use await in loops

One of my older post is about [fetching data from a GraphQL API with Eleventy](/blog/headless-cms-graphql-api-eleventy/). While the example code I wrote works, it does not retrieve data in a very performant way.

The problem is that I use await in a while loop (like a dummy). The direct consequence of this is that the API calls happen sequentially, as [brilliantly explained by Jason Lengstorf](https://www.learnwithjason.dev/blog/keep-async-await-from-blocking-execution/). Each call has to wait for the previous one to finish instead of running in parallel.

Retrieveing all records from an API that at build time is a pretty common use case with static site generators and headless CMSes. Generally, such APIs are limiting the number of records you can get in one single query and will make you use pagination.

Here is a rough outline of how to deal with this use case in a performant manner:

1. Make a first request to the API to retrieve a first batch of data as well as the total number of itens to retrieve
2. Calculate the number of additional API requests we need to retrieve all data
3. If we need to make more calls, store those additional requests as promises
4. Use `Promise.all` to execute all addtional requests in parallel
5. Sort our data if needed
6. Store all data in a cache file

## Using promises and caching

We will use [Axios](https://github.com/axios/axios) and pagination with a limit of 1 on the [JSON Placeholder API](https://jsonplaceholder.typicode.com/) in this example. That will allow us to make 99 API calls in parallel. We will also use the [flat-cache NPM package](https://www.npmjs.com/package/flat-cache) to store our data for speedier local development.

Now, on with the code! In our Eleventy install, we create a `blogposts.js` file in our `_data` folder.

```js
// required packages
const axios = require("axios");
const path = require("path");
const chalk = require("chalk");
const flatCache = require("flat-cache");

// Config
const ITEMS_PER_REQUEST = 1;
const BASE_API_URL = "https://jsonplaceholder.typicode.com";
const CACHE_KEY = "posts";
const CACHE_FOLDER = path.resolve("./.cache");
const CACHE_FILE = "posts.json";

/**
 * Request posts
 * @param {Int} skipRecords - number or records to skip
 * @return {Object} - Total number of items and API data
 */
async function requestPosts(skipRecords = 0) {
  try {
    const url = `${BASE_API_URL}/posts?_start=${skipRecords}&_limit=${ITEMS_PER_REQUEST}`;
    const response = await axios.get(url);

    const data = response.data;
    const total = response.headers["x-total-count"];

    // return the total number of items to fetch and the data
    return {
      total: parseInt(total, 10),
      data: data,
    };
  } catch (err) {
    console.error(chalk.red("API not responding, no data returned"));
    return {
      total: 0,
      data: [],
    };
  }
}

/**
 * Get all posts
 * - check if we have a cache
 * - if not make api requests and create cache
 * @return {Array} - array of API data (from cache if there is one or from API)
 */
async function getAllPosts() {
  // load cache
  const cache = flatCache.load(CACHE_FILE, CACHE_FOLDER);
  const cachedItems = cache.getKey(CACHE_KEY);

  // if we have a cache, return cached data
  if (cachedItems) {
    console.log(chalk.blue("Posts from cache"));
    return cachedItems;
  }

  // if we do not, make queries
  console.log(chalk.blue("Posts from API"));

  // variables
  let requests = [];
  let apiData = [];
  let additionalRequests = 0;

  // make first request and marge results with array
  const request = await requestPosts();
  apiData.push(...request.data);
  // calculate how many additional requests we need
  additionalRequests = Math.ceil(request.total / ITEMS_PER_REQUEST) - 1;

  // create additional requests
  for (let i = 1; i <= additionalRequests; i++) {
    let start = i * ITEMS_PER_REQUEST;
    const request = requestPosts(start);
    requests.push(request);
  }

  // resolve all additional requests in parallel
  const allResponses = await Promise.all(requests);
  allResponses.map((response) => {
    apiData.push(...response.data);
  });

  // sort data as needed
  apiData.sort((a, b) => {
    return a.id - b.id;
  });

  // set and save cache
  if (apiData.length) {
    cache.setKey(CACHE_KEY, apiData);
    cache.save();
  }

  // return data
  return apiData;
}

// export for 11ty
module.exports = getAllPosts;
```

Data from our API is now available in our templates under the `blogposts` key. We can create our list of blogposts and, [using `pagination` with a `size` of `1`](https://www.11ty.dev/docs/pages-from-data/), we can also create all our blogposts detail pages.

By having requests running in parallel, we fetched our data in a performant manner. When comparing this approach to the more sequential one used in my previous blogpost with the same API, performance is eight to ten times faster.

Storing that data in a static cache allows us to not constantly hit the API during development. I usually delete that cache as part of my build process, so I'm certain that I get fresh data from the API or from the headless CMS every time the site is built. If you need your caching to be more versatile and configurable, check out the [`eleventy-cache-assets`](https://github.com/11ty/eleventy-cache-assets) plugin by Zach himself.
