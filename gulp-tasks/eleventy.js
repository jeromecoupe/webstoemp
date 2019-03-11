// packages
const cp = require("child_process");

// Eleventy
function build() {
  return cp.spawn("npx", ["eleventy", "--quiet"], { stdio: "inherit" });
}

// exports
module.exports = {
  build: build
};
