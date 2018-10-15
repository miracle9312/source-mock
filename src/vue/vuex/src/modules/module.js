export class Module {
  constructor (rawRootModule, runtime) {
    const rawState = rawRootModule.state;

    this.runtime = runtime;// 1.todo:runtime的作用是啥
    this._rawModule = rawRootModule;
    this.state = typeof rawState === "function" ? rawState() : rawState;
  }

  // 遍历mumation方法
  forEachMutation() {},
  // 遍历对象方法
  forEachValue() {}
}
