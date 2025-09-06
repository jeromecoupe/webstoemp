function projects(collection) {
  return collection
    .getFilteredByGlob("./src/content/projects/*.md")
    .filter((item) => item.data.archived !== true)
    .reverse();
}

export { projects };
