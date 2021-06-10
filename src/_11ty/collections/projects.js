module.exports = (collection) => {
  return collection.getFilteredByGlob("./src/content/projects/*.md").reverse();
};
