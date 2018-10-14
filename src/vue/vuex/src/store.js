import applyMixin from "./mixin";

let Vue = null;

export class Store {
  constructor (options = {}) {
    this.test = null;
  }
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
