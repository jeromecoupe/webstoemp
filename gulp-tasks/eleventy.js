// packages
const cp = require("child_process");

// Eleventy
function eleventyBuild() {
  return cp.spawn("npx", ["eleventy", "--quiet"], {
    stdio: "inherit",
  });
}

// exports
module.exports = {
  build: eleventyBuild,
};
