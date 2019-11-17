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

const webpack = require('webpack');

module.exports = {
  entry: {
    foo: './foo.js',
    bar: './bar.js'
  },
  output: {
    filename: '[name].js'
  },
  plugin: [
    new webpack.optimize.CommonsChunkPlugin({
      name: 'commons',
      filename: 'common.js'
    })
  ]
};

//index.html
<script src="dist/lib.js"></script>
<script src="dist/app.js></script>
