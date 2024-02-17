function projects(collection) {
  return collection.getFilteredByGlob("./src/content/projects/*.md").reverse();
}

export { projects };
