// packages
const browsersync = require("browser-sync").create();

// BrowserSync
function init(done) {
  browsersync.init({
    server: "./dist/",
    files: [
      "./dist/css/*.css",
      "./dist/js/*.js",
      "./dist/*.{html, xml}",
      "./dist/**/*.{html, xml}",
    ],
    port: 3000,
    open: false,
  });
  done();
}

// exports
module.exports = {
  init: init,
};
