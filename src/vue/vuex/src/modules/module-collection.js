import Module from "./module";

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
