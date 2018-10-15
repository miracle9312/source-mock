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
    // 模块赋值, mutations注册
    installModule();
  }

  installModule () {
    // 注册mutation事件队列
    registerMutation () {};
  }

  // 触发对应type的mutation
  commit () {}
}

export function install (_Vue) {
  // 避免重复安装
  if (Vue && Vue === _Vue) {
    // 开发环境报错
    console.warn("duplicate intall");
  }
  Vue = _Vue;
  // 开始注册全局mixin
  applyMixin(Vue);
}
