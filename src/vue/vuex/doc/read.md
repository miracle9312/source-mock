# xxxx
## 一 install
为了实现通过Vue.use()方法引入vuex，需要为vuex定义一个install方法。vuex中的intall方法主要作用是将store实例注入到每一个vue实例中，具体实现方式如下
```
export function install (_Vue) {
  // 避免重复安装
  if (Vue && Vue === _Vue) {
    // 开发环境报错
    console.warn("duplicate install");
  }
  Vue = _Vue;
  // 开始注册全局mixin
  applyMixin(Vue);
}
```
以上代码中通过定义一个全局变量Vue保存当前的引入的Vue来避免重复安装，然后通过apllyMixin实现将store注入到各个实例中去
```
export default function (Vue) {
  // 获取vue版本
  const version = Number(Vue.version.split(".")[0]);

  // 根据版本选择注册方式
  if (version >= 2) {
    // 版本大于2在mixin中执行初始化函数
    Vue.mixin({ beforeCreate: vuexInit });
  } else {
    // 低版本，将初始化方法放在options.init中执行
    const _init = Vue.prototype._init;

    Vue.prototype._init = function (options = {}) {
      options.init = options.init
        ? [vuexInit].concat(options.init)
        : vuexInit;
      _init();
    };
  }

  // 初始化函数:将store作为属性注入到所有组件中
  function vuexInit () {
    // 根组件
    if (this.$options && this.$options.store) {
      this.$store = typeof this.$options.store === "function"
        ? this.$options.store()
        : this.$options.store;
    } else if (this.$options.parent && this.$options.parent.$store) { // 非根组件
      this.$store = this.$options.parent.$store;
    }
  }
}
```
首先看这段代码核心逻辑实现的关键函数vuexInit，该函数首先判断this.$options选项（该选项在根实例实例化时传入new Vue(options:Object)）
中是否包含this.$store属性，如果有，则将实例的this.$store属性指向this.$options.$store,如果没有则指向this.$parent即父实例中的$store。
此时我们在install执行后，通过在实例化根组件时把store传入options就能将所有子组件的$store属性都指向这个store了。
```
new Vue({
  store
})
```
此外需要注意的时applyMixin执行时首先会判断当前Vue的版本号，版本2以上通过mixin混入的方式在所有组件实例化的时候执行vueInit，而
版本2以下则通过options.init中插入执行的方式注入。以下时安装函数的几点总结
- 避免重复安装
- 判断版本，不同版本用不同方式注入初始方法，2之前通过options.init注入，2之后通过mixin注入
- 将store注入到所有vue的实例属性$store中

## 二、如何实现一个简单的commit
commit实际上就是一个比较简单的发布-订阅模式的实现，不过这个过程中会涉及module的实现，state响应式的实现方式，为之后介绍action可以做一些铺垫
### 使用
首先回顾下commit的使用
```
// 实例化store
const store = new Vuex.Store({
  state: { count: 1 },
  mutations: {
    add (state, number) {
      state.count += number;
    }
  }
}); 
```
实例化store时，参数中的mutation就是事件队列中的事件，每个事件传入两个参数，
分别时state和payload,每个事件实现的都是根据payload改变state的值
```
<template>
    <div>
        count:{{state.count}}
        <button @click="add">add</button>
    </div>
</template>

<script>
  export default {
    name: "app",
    created () {
      console.log(this);
    },
    computed: {
      state () {
        return this.$store.state;
      }
    },
    methods: {
      add () {
        this.$store.commit("add", 2);
      }
    }
  };
</script>

<style scoped>

</style>
``` 
我们在组件中通过commit触发相应类型的mutation并传入一个payload，此时state会实时发生变化

### 实现
首先来看为了实现commit我们在构造函数中需要做些什么
```
export class Store {
  constructor (options = {}) {
    // 声明属性
    this._mutations = Object.create(null);// 为什么不直接赋值null
    this._modules = new ModuleCollection(options);
    // 声明发布函数
    const store = this;
    const { commit } = this;
    this.commit = function (_type, _payload, _options) {
      commit.call(store, _type, _payload, _options);
    };
    const state = this._modules.root.state;
    // 安装根模块
    this.installModule(this, state, [], this._modules.root);
    // 注册数据相应功能的实例
    this.resetStoreVm(this, state);
  }
```
首先是三个实例属性_mutations是发布订阅模式中的事件队列，_modules属性用来封装传入的options
为其提供一些基础的操作方法，commit方法用来触发事件队列中相应的事件；然后我们会在installModule
中注册事件队列，在resetStoreVm中实现一个响应式的state。

> 问题 <br>
- 为什么要把commit在构造函数中又重复定义一次<br>
- _mutations为什么不直接复制null，而用Object.create(null)

#### modules
在实例化store时我们会传入一个对象参数，这里面包含state,mutations,actions,getters,modules等数据项
我们需要对这些数据项进行封装，并暴露一个这个些数据项的操作方法，这就是Module类的作用，另外在vuex中
有模块的划分，需要对这些modules进行管理，由此衍生出了ModuleCollection类，本节先专注于commit的实现
对于模块划分会放在后面讨论，对于直接传入的state，mutations，actions，getters，在vuex中会
先通过Module类进行包装，然后注册在ModuleCollection的root属性中
```
export default class Module {
  constructor (rawModule, runtime) {
    const rawState = rawModule.state;

    this.runtime = runtime;// 1.todo:runtime的作用是啥
    this._rawModule = rawModule;
    this.state = typeof rawState === "function" ? rawState() : rawState;
  }

  // 遍历mumation,执行函数
  forEachMutation (fn) {
    if (this._rawModule.mutations) {
      forEachValue(this._rawModule.mutations, fn);
    }
  }
}
export function forEachValue (obj, fn) {
  Object.keys(obj).forEach((key) => fn(obj[key], key));
}
```
构造函数中传入的参数rawModule就是{state，mutations，actions，getters}对象,在Module类中
定义两个属性_rawModule用于存放传入的rawModule,forEachMutation实现mutations的遍历执行，将mutation对象的
value,key传入fn并执行，接下去将这个module挂在modulecollection的root属性上
```
export default class ModuleCollection {
  constructor (rawRootModule) {
    // 注册根module，入参：path,module,runtime
    this.register([], rawRootModule, false);
  }

  // 1.todo runtime的作用？
  register (path, rawRootModule, runtime) {
    const module = new Module(rawRootModule, runtime);

    this.root = module;
  }
}
```
经过这样一系列的封装，this._modules属性就是下面这样的数据结构
![](./images/commit-modules.jpg)

### state
由于mutations中保存的所有事件都是为了按一定规则改变state，所以我们要先介绍下store是如何进行state的管理的
尤其是如何通过state的改变响应式的改变getters中的值，在构造函数中提到过一个方法resetStoreVm，在这个函数中
会进行state的管理
```
  resetStoreVm (store, state) {
    const oldVm = store._vm;
    // 注册
    store._vm = new Vue({
      data: {
        $$state: state
      }
    });
    // 注销旧实例
    if (oldVm) {
      Vue.nextTick(() => {
        oldVm.destroy();
      });
    }
  }
```
这个函数传入两个参数，分别为实例本身和state，首先注册一个vue实例保存在store实例属性_vm上
，其中data数据项中定义了$$state属性指向state，后面会介绍将getters分解并放在computed数据项中
这样很好的利用Vue原有的数据响应系统实现响应式的state，赋新值之后会把老的实例注销。<br>
对于state的包装实际还差一步，我们平常访问state的时候是直接通过store.state访问的，如果不做处理
现在我们只能通过store._vm.data.$$state来访问，实际vuex通过class的get，set属性实现state的访问和更新的
```
export class Store {
  get state () {
    return this._vm._data.$$state;
  }

  set state (v) {
    if (process.env.NODE_ENV !== "production") {
      console.error("user store.replaceState()");
    }
  }
}
```
值得注意的是，我们不同直接对state进行赋值，而要通过store.replaceState赋值，否则将会报错

### 事件注册
接下去终于要步入commit原理的核心了，发布-订阅模式包含两个步骤，事件订阅和事件发布，首先来谈谈vuex是
如何实现订阅过程的
```
export class Store {
  constructor (options = {}) {
    // 声明属性
    this._mutations = Object.create(null);// 为什么不直接赋值null
    this._modules = new ModuleCollection(options);
    const state = this._modules.root.state;
    // 安装根模块
    this.installModule(this, state, [], this._modules.root);
  }

  installModule (store, state, path, module) {
    // 注册mutation事件队列
    const local = this.makeLocalContext(store, path);
    module.forEachMutation((mutation, key) => {
      this.registerMutation(store, key, mutation, local);
    });
  }

  // 注册mutation
  registerMutation (store, type, handler, local) {
    const entry = this._mutations[type] || (this._mutations[type] = []);
    entry.push(function WrappedMutationHandler (payload) {
      handler.call(store, local.state, payload);
    });
  }
```
我们只截取相关的部分代码，其中两个关键的方法installModule和registerMutation,在installModule
方法中会先进行一次惰性求值，获取store中各个值的最新状态
```
 makeLocalContext (store, path) {
    const local = {};
    Object.defineProperties(local, {
      state: {
        get: () => getNestedState(store.state, path)
      }
    });

    return local;
  }
  
  function getNestedState (state, path) {
    return path.length
      ? path.reduce((state, key) => state[key], state)
      : state;
  }
```
makeLocalContext返回一个local对象，其中保存着state的最新值，getNestState会通过路径
搜索得到嵌套对象的指定值，这个写法非常优雅，可以在以后的代码中多学习和运用
在得到这个保存着最新值的对象之后，接下来会遍历mutation并将mutation进行包装后push进指定类型的事件队列
，通过Moulde类的实例方法forEachMutation对mutations进行遍历，并执行registerMutation进行事件的注册，
在registerMutation中返回this._mutations指定类型的事件队列，注册事件后的this._mutations的数据结构如下
![](./images/commit-mutations.jpg)


### 事件发布
根据事件注册后this._mutations的结构，我们可以很轻动的实现事件发布，找到指定类型的事件队列，
遍历这个队列，传入参数并执行。
```
// 触发对应type的mutation
  commit (_type, _payload, _options) {
    // 获取参数
    const {
      type,
      payload
    } = unifyObjectStyle(_type, _payload, _options);
    const entry = this._mutations[type];
    // 遍历触发事件队列
    entry.forEach(function commitIterator (handler) {
      handler(payload);
    });
  }
```
但是需要注意的是，首先需要对参数进行下处理，就是unifyObjectStyle干的事情
```
// 入参规则：type可以是带type属性的对象，也可以是字符串
function unifyObjectStyle (type, payload, options) {
  if (isObject(type)) {
    payload = type;
    options = payload;
    type = type.type;
  }

  return { type, payload, options };
}
```
其实实现了type可以为字符串，也可以为对象，当为对象是，内部使用的type就是type.type，而第二个
参数就变成了type，第三个参数变成了payload。<br>
到此关于commit的原理已经介绍完毕，所有的代码见分支 https://github.com/miracle9312/source-mock/tree/fc1a7cd448d0c22079a1414004fdb1babb90f3b8