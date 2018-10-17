import ModuleCollection from "./modules/module-collection";
import applyMixin from "./mixin";

let Vue = null;
const noop = function () {};

export class Store {
  constructor (options = {}) {
    // 声明属性
    this._committing = false;
    this._mutations = Object.create(null);// 为什么不直接赋值null
    this._modules = new ModuleCollection(options);
    // 声明发布函数
    this.commit = noop;
    const state = this._modules.root
    // 安装根模块
    this.installModule(this, state, [], this._modules.root);
  }

  installModule (store, state, path, module) {
    // 注册mutation事件队列
    const local = this.makeLocalContext(store, path);
    module.forEachMutation((mutation, key) => {
      this.registerMutation(store, local, mutation, key);
    });
  }

  // 注册mutation
  registerMutation (store, local, handler, type) {
    const entry = this._mutations[type] || (this._mutations[type] = []);
    entry.push(function WrapperedMutation (payload) {
      handler.call(store, local.state, payload);
    });
  }

  // 惰性赋值，每次获取最新的module值
  makeLocalContext (store, path) {
    const local = {};
    Object.defineProperty(local, {
      state: () => this.getNestState(store.state, path)
    });

    return local;
  }

  // 根据路径获取嵌套对象值，reduce的运用
  getNestState (state, path) {
    return path
      ? path.reduce((state, key) => state[key], state)
      : state;
  }

  // 触发对应type的mutation
  commit () {}
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
