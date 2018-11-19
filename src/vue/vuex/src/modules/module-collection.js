import { forEachValue } from "../util";
import Module from "./module";

export default class ModuleCollection {
  constructor (rawRootModule) {
    // 注册根module，入参：path,module,runtime
    this.register([], rawRootModule, false);
  }

  // 根据路径获取模块，从root开始搜索
  get (path) {
    return path.reduce((module, key) => module.getChild(key), this.root);
  }

  // 根据路径返回namespace
  getNamespace (path) {
    let module = this.root;

    return path.reduce((namespace, key) => {
      module = module.getChild(key);

      return namespace + (module.namespaced ? `${key}/` : "");
    }, "");
  }

  // 1.todo runtime的作用？
  register (path, rawModule, runtime = true) {
    // 生成module
    const newModule = new Module(rawModule, runtime);
    if (path.length === 0) { // 根模块，注册在root上
      this.root = newModule;
    } else { // 非根模块，获取父模块，挂载
      const parent = this.get(path.slice(0, -1));
      parent.addChild(path[path.length - 1], newModule);
    }

    // 模块上是否含有子模块，有则注册子模块
    if (rawModule.modules) {
      forEachValue(rawModule.modules, (newRawModule, key) => {
        this.register(path.concat(key), newRawModule, runtime);
      });
    }
  }
}
