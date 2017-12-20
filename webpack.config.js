/**
 * Created by miracle on 2017/12/18.
 */
const path = require('path');

module.exports = {
    entry:'./src/vuex/src/main.js',
    output:{
        filename:'bundle.js',
        path:path.resolve(__dirname, 'src/vuex/dist')
    },
    module: {
        rules:[
            { test: /\.js$/, exclude: /node_modules/, loader: ["babel-loader"] },
            {
                test: /\.vue$/,
                loader: 'vue-loader',
                options: {
                    loaders: {
                        js: 'babel-loader!eslint-loader'
                    }
                }
            }
        ]
    },
    resolve: {
        alias: {
            'vue$': 'vue/dist/vue.esm.js'
        }
    }
};