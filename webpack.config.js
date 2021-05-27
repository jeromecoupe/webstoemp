const path = require("path");

module.exports = {
  mode: "production",
  entry: "./src/assets/js/main.js",
  output: {
    path: path.resolve(__dirname, "./dist/assets/js"),
    filename: "main.bundle.js",
  },
  module: {
    rules: [
      {
        test: /\.js?$/,
        include: [path.resolve(__dirname, "./src/assets/js")],
        loader: "babel-loader",
      },
    ],
  },
};
