const path = require("path");

module.exports = {
  entry: {
    index: path.resolve(__dirname, "src/index.js")
  },
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "[name].js",
    libraryTarget: "window"
  },
  module: {
    rules: [
      {
        test: /\.(css|scss)$/,
        use: ["style-loader", "css-loader", "sass-loader"]
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: ["miasm-prefix-loader?sourceMap=true", "babel-loader"]
      }
    ]
  },
  devServer: {
    publicPath: "/dist/",
    port: 3000
  }
};
