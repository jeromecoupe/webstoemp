const path = require("path");

module.exports = {
  output: {
    filename: "main.bundle.js"
  },
  module: {
    rules: [
      {
        test: /\.js?$/,
        include: [path.resolve(__dirname, "./assets/js")],
        loader: "babel-loader"
      }
    ]
  }
};
