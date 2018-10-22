import ModuleCollection from "./modules/module-collection";
import applyMixin from "./mixin";
import { isObject, isPromise } from "./util";

let Vue = null;

export class Store {
  constructor (options = {}) {
    // 声明属性
    this._mutations = Object.create(null);// 为什么不直接赋值null
    this._actions = Object.create(null);
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

  get state () {
    return this._vm._data.$$state;
  }

  set state (v) {
    if (process.env.NODE_ENV !== "production") {
      console.error("user store.replaceState()");
    }
  }

  installModule (store, state, path, module) {
    // 注册mutation事件队列
    const local = this.makeLocalContext(store, path);
    module.forEachMutation((mutation, key) => {
      this.registerMutation(store, key, mutation, local);
    });

    module.forEachAction((action, key) => {
      this.registerAction(store, key, action, local);
    });
  }

  // 注册action
  registerAction (store, type, handler, local) {
    const entry = this._actions[type] || (this._actions[type] = []);
    entry.push(function WrapperedActionHandler (payload, cb) {
      const res = handler.call(local, payload, cb);
      if(!isPromise(res)) {
        res = Promise.resolve(res);
      }

      return res;
    });
  }

  // 注册mutation
  registerMutation (store, type, handler, local) {
    const entry = this._mutations[type] || (this._mutations[type] = []);
    entry.push(function WrappedMutationHandler (payload) {
      handler.call(store, local.state, payload);
    });
  }

  // 惰性赋值，每次获取最新的module值 todo
  makeLocalContext (store, path) {
    const local = {};
    Object.defineProperties(local, {
      state: {
        get: () => getNestedState(store.state, path)
      }
    });

    return local;
  }

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

  // 注册响应式实例
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
}

// 入参规则：type可以是带type属性的对象，也可以是字符串
function unifyObjectStyle (type, payload, options) {
  if (isObject(type)) {
    payload = type;
    options = payload;
    type = type.type;
  }

  return { type, payload, options };
}

// 根据路径获取嵌套对象值，reduce的运用
function getNestedState (state, path) {
  return path.length
    ? path.reduce((state, key) => state[key], state)
    : state;
}

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
