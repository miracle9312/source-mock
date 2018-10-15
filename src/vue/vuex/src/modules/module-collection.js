export class ModuleCollection {
  constructor (rawModule) {
    // 注册根module，入参：path,module,runtime
    this.register([], rawModule, false);
  }

  register (path, rawModule, runtime) {
    const module = new Module(rawModule);

    this.root = module;
  }
}
