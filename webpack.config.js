const path = require("path");

module.exports = {
  mode: "production",
  entry: "./src/assets/js/main.js",
  output: {
    path: path.resolve(__dirname, "./dist/js"),
    filename: "main.bundle.js",
  },
  module: {
    rules: [
      {
        enforce: "pre",
        test: /\.js$/,
        include: [path.resolve(__dirname, "./src/assets/js")],
        loader: "eslint-loader",
      },
      {
        test: /\.js?$/,
        include: [path.resolve(__dirname, "./src/assets/js")],
        loader: "babel-loader",
      },
    ],
  },
};
