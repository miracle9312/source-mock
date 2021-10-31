/**
 * 重构技巧->函数柯里化->抽象传参，抽象基础编译逻辑，实现跨平台编译
 * 原函数参数不改变前提，支持参数拓展
 * */
const createCompilerCreator = (baseCompile) => {
  const createCompiler = (baseOptions) => {
    const compiler = (template, options) => {
      // 根据baseOptions调用baseCompile
    }

    return {compiler}
  }
  return createCompiler
}

// 等价于=====>

const compiler = (baseCompile, baseOptions, template, options)=> {
  // 编译函数
}

// 重构过程
// 1.原本的函数
const compiler = (template, options)=> {
  // 内部包含baseCompile, baseOptions逻辑
}

// 2.提取核心编译模块
const compiler = (template, options)=> {
  const baseOptions = {}
  const baseCompile = ()=>{}
}

// 3.支持内部核心编译和编译方式可透传
const createCompilerCreator = (baseCompile) => {
  const createCompiler = (baseOptions) => {
    const compiler = (template, options) => {
      // 根据baseOptions调用baseCompile
    }

    return {compiler}
  }
  return createCompiler
}

// 4.效果
// 支持web端的编译
const webCreateCompiler = createCompilerCreator(function($){return $.('')});
const webCompiler = webCreateCompiler({isChrome: true})
// 支持原生编译
const nativeCreateCompiler = createCompilerCreator(function(weex){return weex.('')});
const nativeCompiler = nativeCreateCompiler({isIOS: true})


