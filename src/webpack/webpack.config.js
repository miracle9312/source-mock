const path = require("path");

module.exports = {
  entry: {
    one: path.resolve(__dirname, "src/testOne.js"),
    two: path.resolve(__dirname, "src/testTwo.js")
  },
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "[name].js",
    libraryTarget: "window"
  }
};
