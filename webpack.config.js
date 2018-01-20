/**
 * Created by miracle on 2017/12/18.
 */
const path = require('path');

module.exports = {
  entry: './src/vuex/main.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'src/vuex/dist')
  },
  module: {
      rules: [
          {
              enforce: 'pre',
              test: /\.(js|vue)$/,
              loader: 'eslint-loader',
              exclude: /node_modules/
          },
          {
              test: /\.js$/,
              exclude: /node_modules/,
              loader: 'babel-loader'
          },
          {
              test: /\.vue$/,
              loader: 'vue-loader'
          },
          {
              test: /\.css$/,
              use: [
                  'style-loader',
                  'css-loader'
              ]
          }
      ]
  },
    resolve: {
        extensions: [
            '.js',
            '.vue'
        ],
        alias: {
            'vue$': 'vue/dist/vue.common.js',
        }
    }
}
