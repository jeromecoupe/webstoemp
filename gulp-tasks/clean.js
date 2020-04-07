// packages
const del = require("del");

// Clean
function cleanDist() {
  return del(["./dist/"]);
}

// exports
module.exports = {
  dist: cleanDist,
};
