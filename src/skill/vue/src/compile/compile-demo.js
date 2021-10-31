/**
 * 字符串变成可执行代码: 将字符串变为可执行的匿名函数
 * 输入："var a = 1; var b =1; var c=a+b; console.log(a);"
 * 输出：ƒ anonymous() {
        var a = 1; var b =1; var c=a+b; console.log(a);
   }
 * */
function createFunction (code, errors) {
  return new Function(code)
}

// 本质：
// 1.将基础compile返回的代码字符片段转化为一个可执行的函数
// 2.缓存执行结果
const createCompileToFunctionFn = (compile) => {
  // 闭包，缓存编译结果
  const cached = {}
  const compileToFunctions = (template, options, vm) => {
    // 1-> 缓存处理
    const key = options.delimiters;

    if (cache[key]) {
      return cache[key]
    }

    // 2->执行编译
    const compiled = compile(template, options)

    // 3-> 将便一个代码字符串片段转化为可执行函数
    const res = {}
    const fnGenErrors = []
    res.render = createFunction(compiled.render, fnGenErrors)
    res.staticRenderFns = compiled.staticRenderFns.map(code => {
      return createFunction(code, fnGenErrors)
    })

    return (cached[key] = res)
  }
  return compileToFunctions
}

const baseCompile = () => {
  // 1. 解析模板字符串生成 AST
  const ast = parse(template.trim(), options)
  // 2. 优化语法树
  optimize(ast, options)
  // 生成代码
  const code = generate(ast, options)
}

const createCompilerCreator = (baseCompile) => {
  const createCompiler = (baseOptions) => {
    const compile = (template, options) => {
      // 根据baseOptions调用baseCompile
      return {
        ast,// ast树：代码结构的json格式描述
        render,// 渲染函数：字符串类型
        staticRenderFns
      }
    }

    return {
      compile,
      compileToFunctions: createCompileToFunctionFn(compile)
    }
  }
  return createCompiler
}
