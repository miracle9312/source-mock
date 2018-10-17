import { forEachValue } from "../util";

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
