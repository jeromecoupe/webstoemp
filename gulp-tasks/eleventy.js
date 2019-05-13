// packages
const cp = require("child_process");

// Eleventy
function eleventyBuild() {
  return cp.execFile("npx", ["eleventy", "--quiet"]);
}

// exports
module.exports = {
  build: eleventyBuild
};
