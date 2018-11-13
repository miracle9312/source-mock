import { forEachValue } from "../util";

export default class Module {
  constructor (rawModule, runtime) {
    const rawState = rawModule.state;

    this.runtime = runtime;// 1.todo:runtime的作用是啥
    this._rawModule = rawModule;
    this._children = Object.create(null);
    // 此处state可以为函数，主要用于多个模块同时引用一个state时，防止数据污染
    this.state = typeof rawState === "function" ? rawState() : rawState;
  }

  getChild (key) {
    return this._children[key];
  }

  addChild (key, module) {
    this._children[key] = module;
  }

  // 遍历mumation,执行函数
  forEachMutation (fn) {
    if (this._rawModule.mutations) {
      forEachValue(this._rawModule.mutations, fn);
    }
  }

  // 遍历action，执行函数
  forEachAction (fn) {
    if (this._rawModule.actions) {
      forEachValue(this._rawModule.actions, fn);
    }
  }

  forEachGetters (fn) {
    if (this._rawModule.getters) {
      forEachValue(this._rawModule.getters, fn);
    }
  }

  forEachChild (fn) {
    forEachValue(this._children, fn);
  }
}
