const now = new Date();

module.exports = (collection) => {
  return collection
    .getFilteredByGlob("./src/content/blogposts/*.md")
    .filter((item) => item.data.draft !== true && item.date <= now)
    .reverse();
};
