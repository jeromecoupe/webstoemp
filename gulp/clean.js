// packages
const del = require("del");

// Clean
function all() {
  return del(["./dist/"]);
}

// exports
module.exports = {
  all: all
};
