## SSR 实践

### 代码同构：

服务端渲染配置

#### 创建服务端渲染vue实例

app.vue
```js
<template>
    <div id="app">
        <span>title: ssr demo</span>
        <span>content: hello world</span>
    </div>
</template>

<script>
  export default {
    name: 'app'
  };
</script>

<style scoped>

</style>

```

createApp.js

```js
import Vue from 'vue'
import App from './app.vue'

export default () => {
  const app = new Vue({
    render: h=>h(App)
  })

  return {
    app
  };
}

```

vue.config.js

```js
const nodeExternals = require("webpack-node-externals");
const VueSSRServerPlugin = require('vue-server-renderer/server-plugin')

module.exports = {
  css: {
    // 不提取 CSS
    extract: false
  },
  outputDir: 'serverDist',
  configureWebpack: () => ({
    // 服务器入口文件
    entry: `./src/server-entry.js`,
    devtool: 'source-map',
    // 构建目标为nodejs环境
    target: 'node',
    output: {
      // 构建目标加载模式 commonjs
      libraryTarget: 'commonjs2'
    },
    // 跳过 node_mdoules，运行时会自动加载，不需要编译
    externals: nodeExternals({
      // 允许css文件，方便css module
      allowlist: [/\.css$/]
    }),
    // 关闭代码切割
    optimization: {
      splitChunks: false
    },
    plugins: [
      new VueSSRServerPlugin()
    ]
  })
};

```
以上配置可以得到一个输出在serverDist目录下的服务端渲染的meta文件，后续通过vue-server-renderer将vue实例渲染为html模板

server.js 

```js
const path = require('path')
const fs = require('fs')
const express = require('express')
const app = express();
const {createBundleRenderer} = require('vue-server-renderer');
const serverBundle = path.resolve(process.cwd(), 'serverDist', 'vue-ssr-server-bundle.json');
const template = fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf-8');
console.log(template)
const renderer = createBundleRenderer(serverBundle, {
  template,
});

app.get('/', (req, res)=> {
  renderer.renderToString({}, (err, html) => {
    if (err) {
      console.log(err);
      res.send('500 server error');
      return;
    }
    res.send(html);
  })
})

app.listen('3001', ()=>{
  console.log('server start on 3001')
})

```

#### 创建客户端渲染vue实例

增加客户端渲染配置

```js
const VueSSRClientPlugin = require('vue-server-renderer/client-plugin')

module.exports = {
  configureWebpack: () => ({
    entry: `./src/client-entry.js`,
    devtool: 'source-map',
    target: 'web',
    plugins: [
      new VueSSRClientPlugin()
    ]
  }),
  chainWebpack: config => {
    config.plugins.delete('html');
    config.plugins.delete('preload');
    config.plugins.delete('prefetch');
  }
};
```

新增依据构建环境生成的总配置
```js
const TARGET_NODE = process.env.WEBPACK_TARGET === 'node';
const serverConfig = require('./server.config');
const clientConfig = require('./client.config');

if (TARGET_NODE) {
  module.exports = serverConfig;
} else {
  module.exports = clientConfig;
}
```

新增客户端渲染入口

```js
import createApp from './createApp'

const {app} = createApp();

app.$mount('#app');

```

server修改，将客户端标签通过解析meta.json渲染生成

```js
const path = require('path')
const fs = require('fs')
const express = require('express')
const app = express();
const {createBundleRenderer} = require('vue-server-renderer');
const serverBundle = path.resolve(process.cwd(), 'serverDist', 'vue-ssr-server-bundle.json');
const template = fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf-8');
const clientManifestPath = path.resolve(process.cwd(), 'dist', 'vue-ssr-client-manifest.json');
const clientManifest = JSON.parse(fs.readFileSync(clientManifestPath, 'utf-8'));
const renderer = createBundleRenderer(serverBundle, {
  template,
  clientManifest
});

app.use(express.static(path.resolve(process.cwd(), 'dist')));

app.get('/', (req, res)=> {
  renderer.renderToString({}, (err, html) => {
    if (err) {
      console.log(err);
      res.send('500 server error');
      return;
    }
    res.send(html);
  })
})

app.listen('3001', ()=>{
  console.log('server start on 3001')
})

```

### Store同步

#### 创建store

createStore.js
```js
import Vue from 'vue';
import Vuex from 'vuex';
import {fetchItem} from './api';

Vue.use(Vuex);

export default function createStore() {
  return new Vuex.Store({
    state: {
      item: {}
    },
    actions: {
      fetchItem({ commit }) {
        return fetchItem(1).then(item => {
          console.log(item)
          commit('setItem', item);
        });
      }
    },
    mutations: {
      setItem(state, item) {
        state.item = item;
      }
    }
  })
}

```

api.js

```js

export function fetchItem(id) {
  const items = [
    { name: 'item1', id: 1 },
    { name: 'item2', id: 2 },
    { name: 'item3', id: 3 }
  ];
  const item = items.find(i => i.id == id);
  return Promise.resolve(item);
}

```

createApp.js
创建store实例并注入

```js
import Vue from 'vue'
import App from './app.vue'
import createStore from './createStore';

export default function createApp(context) {
  const store = createStore();
  const app = new Vue({
    store,
    render: h => h(App)
  });
  return {
    store,
    app
  };
};

```

#### 服务端获取初始数据


在服务端获取数据后进行store同步，修改server.js如下

```js
import createApp from './createApp'

export default context => {
  return new Promise((resolve, reject) => {
    const { app, store } = createApp(context);
    return store.dispatch('fetchItem').then((data)=>{
        console.log(data, "=====data===")
        context.state = store.state;
        resolve(app)
        return app;
    })
  })
}
```

#### 客户端注入初始数据

```js
import createApp from './createApp'

const {app, store} = createApp();

// 注入初始数据
if (window.__INITIAL_STATE__) {
  store.replaceState(window.__INITIAL_STATE__);
}


app.$mount('#app');

```

数据渲染

app.vue

```js
<template>
    <div id="app">
        <div>id: {{item.id}}</div>
        <div>name: {{item.name}}</div>
    </div>
</template>

<script>
  export default {
    name: 'app',
    // asyncData({ store }) {
    //   // 触发 action 后，会返回 Promise
    //   return store.dispatch('fetchItems')
    // },
    computed: {
      // 从 store 的 state 对象中的获取 item。
      item() {
        return this.$store.state.item;
      }
    }
  };
</script>

<style scoped>

</style>
```

### 路由同步

### 问题

1.如何实现服务端和客户端vue同步


