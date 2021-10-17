## webpack

### 为什么需要webpack
#### 代码编写的几个发展阶段

* 石器时代-编辑器+浏览器：js在设计之初作为一门小型脚本语言，只为了实现简单的动态特性，缺少模块化的组织，所以在es6出现之前在语言层面和编译层面并没有支持模块化拆分
* jq时代：直到jquery出现，代码可以利用闭包的形式进行组织，通过script标签顺序引用进行资源依赖处理，但是模块组织通过全局变量控制，容易造成全局变量污染
* 模块化：jq之后逐渐出现了common.js,amd,umd，es6模块化方案，所谓模块化->让每个代码段实现一个特定的目的，可以进行独立设计，开发测试，最终通过接口将其组合

webpack在当时混乱的模块化方案中应运而生，本质上webpack是将集中模块化方案在打包时进行磨平，无论使用何种模块化方案都能在webpack的世界中得到处理

#### webpack能做什么
* 支持多种模块标准（AMD,commonjs.UMD,es6）
* 完备的代码分割方案：对代码进行有效的组织，提取公共资源和业务资源，以及进行资源的动态加载
* 多类型资源处理：图片js,css等

### 实现一个简单的webpack配置

```js 
const path = require("path");

const webpack = require('webpack');

module.exports = {
  entry: {
    foo: './foo.js',
    bar: './bar.js'
  },
  output: {
    filename: '[name].js'
  },
  plugin: [],
  loaders: []
};

//index.html
<script src="dist/lib.js"></script>
<script src="dist/app.js></script>

```

可以看到webpack基础核心的几个模块：入口，出口，loader，plugin,通过以上配置可以实现资源的打包，并输出到指定目录

#### webpack-dev-server
为了便于本地开发调试，webpack-dev-server的核心功能包含
* 文件保存后自动舒心
* 资源入内存不重复编译构建

### 模块化

对于主流标准的集中模块方案，我们需要了解的几个重要知识点

* 静态分析和动态分析：静态分析-资源依赖关系由编译时确定，动态分析，资源依赖更新由运行时更新，动态分析的优势是可以在后续进行tree-shaking进行死代码检测，去除无用依赖

* 值拷贝和动态映射：值拷贝-引用的是对原资源运行结果的拷贝；动态映射-引用的是原资源运行结果的地址；所以动态映射不能直接修改引用的值，会造成其他引用的值修改出现异常调用

### loader
loader可以理解成webpack处理文件的流水线工具，相当于node框架的中间件

#### 编写一个loader

``` js
/* eslint-disable */
var loaderUtils = require('loader-utils');
var SourceNode = require('source-map').SourceNode;
var SourceMapConsumer = require('source-map').SourceMapConsumer;

module.exports = function (content, sourceMap) {
  if(this.cacheable) {
    this.cacheable();
  }
  var options = loaderUtils.getOptions(this) || [];
  var MIASM_PREFIX = "\/*hello shaoxuezheng awesome project*\/\n\n";
  console.log(sourceMap, "====sourceMap======");
  if(options.sourceMap && sourceMap) {
    console.log(options, "====here======");
    var currentRequest = loaderUtils.getCurrentRequest(this);
    var node = SourceNode.fromStringWithSourceMap(content, new SourceMapConsumer(sourceMap));
    node.prepend(MIASM_PREFIX);
    var result = node.toStringWithSourceMap({file: currentRequest});
    console.log(result, '====result====');
    var callback = this.async();
    callback(null, result.code, result.map.toJSON());
  }
  console.log(MIASM_PREFIX);

  return MIASM_PREFIX + content;
};

```
loader的输入和输出
* content: 上个loader处理后的文本字符串
* sourceMap：上个loader处理后的源代码
* AST: 上个loader处理后的AST
callback类似于node中间件的next,触发下层调用，所有的loader本质上都是修改content和soucremap，可以理解成node的统一上下文request

#### loader包含的配置

* test:正则匹配文件
* use: 使用指定的loader
* options: 配置选项
* include,exclude: loader作用域

### 代码分片
代码分片的本质，就是将引用的公共资源进行提取，不重复输出
commonChunkPlugin: 可以进行配置公共资源提取，并且通过一些特定策略进行判断是否为公共资源进行更细粒度的优化


### 打包优化

打包优化的本质：利用本地资源，缩小打包作用域

利用本地资源

* HappyPackPlugin：开启多线程进行打包

缩小作用域名

* include,exclude: 指定loader作用域打包
* noParse: 忽略指定文件解析(资源会打到bundle)
* IgnorePlugin: 忽略指定文件打包（资源完全不会达到bundle）
* cache: 开启loader，cache可以在文件不更改时不执行打包
* treeshaking: 死代码检测，去除未被引用的资源打包

### 几点思考

* 本地开发环境变量的控制可以通过webpack环境参数控制，全局变量可以使用handlebars注入
* 历史资源版本方式注入的资源可以通过webpack在本地直接处理，可以使用引用时再次构建，而不是简单拼接
* 现在su-cli资源依赖引用可以通过handlebar优化
* 我终于知道星云组件渲染引擎引用实际上是通过amd实现资异步引用的了

