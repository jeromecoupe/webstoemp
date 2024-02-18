const now = new Date();

function blogposts(collection) {
  return collection
    .getFilteredByGlob("./src/content/blogposts/*.md")
    .filter((item) => item.data.draft !== true && item.date <= now)
    .reverse();
}

export { blogposts };
