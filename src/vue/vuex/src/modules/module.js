export default class Module {
  constructor (rawModule, runtime) {
    const rawState = rawModule.state;

    this.runtime = runtime;// 1.todo:runtime的作用是啥
    this._rawModule = rawModule;
    this.state = typeof rawState === "function" ? rawState() : rawState;
  }

  // 遍历mumation方法
  forEachMutation() {},
  // 遍历对象方法
  forEachValue() {}
}
