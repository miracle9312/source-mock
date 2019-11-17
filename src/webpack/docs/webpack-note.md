## webpack学习
本篇文章是《webpack实战》的阅读总结，书的作者是开源打包工具Ykit的主导者居玉皓，作者在构建工具开发上有着非常丰富的实战经验；
书中未涉及webpack源码的解读，主要阐述了如何利用webpack进行项目最佳构建方案的探索，所以阅读难度不大。
其实对于webpack的学习可以总结为模块，输入输出，预处理器loader，插件plugin，以及构建性能优化几个方面，所以以下我梳理的知识点也都包含在这其中。

### 模块
在模块这个概念出现之前，所有js模块都是通过scipt标签引用的方式实现，每个模块的顶层作用域都是全局作用域，在进行变量声明时会污染全局环境
而后续推陈出新的模块方案实际上都是通过形成属于模块自身的作用域来解决这个问题。
#### 常用的几中模块标准
- commnJS:

导出：
```
/* calculator.js */
module.exports = {
    add: function(a, b) { return a+b; }
}
```
导入：

```
/* index.js */
const calcuator = require('./calcuator.js')
```

- es6 module
导出：
```
/* calcuator.js */
export default function(a, b) { return a+b; }
```
导入：

```
/* index.js */
import calcuator from './caculator.js';
```
另外还有AMD.js，sea.js等不再赘述

#### 关于几种模块的差异

##### 动态与静态

commonJS采用的是静态依赖的方式，而ES6 module采用的是动态依赖，关于这两者的差异官方的解释
>"'动态'模块依赖关系的建立发生在代码运行时，而'静态'模块依赖关系的建立发生在代码编译时"

对于这个差异我的翻译是：假如把建立模块依赖比喻成将代码垒成一道墙，而各个依赖是水泥，砖头，
胶水，木头，也可能会有车床（出现车床是不是有点奇怪，高能在后方），那么动态依赖就是在建立依赖前把所有这些都堆在工地上，然后要什么取什么，而动态依赖就比较
有水平了，它事先分析了一道墙需要什么（术语就是建立依赖图chunk），取到的都是用到的，这样工地上就不会出现车床了。
##### 值拷贝与动态映射

>在导入一个模块时，对于commonJS来说获取的是导出值的拷贝，而在ES6 Module中则是动态映射；

专家们都喜欢用术语吓唬人，其实很简单
再将模块做个比喻，他现在是个人，那commonJS导入的是一个克隆人，而ES6导入的是镜子里的人。所以commonJS导入的对象是可以进行读写的，而es6 module导入的对象是只读的。
##### 循环依赖
commonJS和ES6在出现依赖循环时处理的结果也有所不同，由于commonJS在模块初次导入时会在模块系统中建立一个该模块的空对象，所以在该模块未执行完前，所有
对该模块的引用都是空对象。而es6 module会直接输出undefined，这就是这两个模块标准在处理循环依赖的本质

### 输入与输出
在流程的开始，需要指定一个入口或多个入口，如果把各个模块的依赖关系当成一棵树，那入口就是树的根，webpack会从入口文件开始检索，并将具有依赖关系的模块生成一棵依赖树
最终得到一个chunk，由这个chunk得到的打包产物称之为bundle,如下图

<img style="margin: auto;display: block;" src="../assets/chunk.jpg" width="500px" height="250px"/>

如下是资源输入输出的相关配置
- entry:入口文件路径，可以是字符串类型，数组类型，对象类型函数类型，函数类型，有如下几个功能的选择，选择依赖，多入口配置，根据环境生成不同配置，可以根据场景选择适合的类型
- output:输出配置，可以指定文件名（filename），输出路径(path)，另外可以根据文件生成hash值，利用hash值进行命名解除缓存

### 预处理器loader
loader本质是一个函数，可以用如下公式表达
> output = loader(input)

input可能是工程源文件的字符串，也可能是上一个loader转化后的结果，包含转化后的文件（字符串类型），source map，以及AST对象，output同样包含这几样信息

关于loader比较重要的主要是两大块，配置和实现
#### 配置
- test: 用于匹配文件，可接受一个正则表达式或者一个元素为正则表达是的数组，只有正则匹配上的模块才会使用这条规则
- use:可接受一个数组，数组包含该规则所使用的loader
- options:预处理器接收的参数，根据该参数进行不同形式的预处理
- exclude，include:文件过滤，利用正则对文件路径和文件名的匹配，这里需要注意的是exclude的优先级要高于include
- resource，issuer:在exclude和include的基础上进行更加细粒度的过滤，exclude和include实际上都是对被加载者的过滤
而对resource，issuer进行配置可以实现对加载者的过滤
- enforce：配置预处理执行时期，常用的有pre，normal和post

#### 实现一个简单的loader
原理上实际就是编写一个文件处理的函数，输入和输出都是确定的，比较简单，这里有我实现的一个在打包文件前统一加描述的简单loader
[misasm-prefix-loader](https://github.com/miracle9312/source-mock/tree/master/src/webpack/src/loaders/miasm-prefix-loader)

### 样式处理

- style-loader和css-loader对样式进行处理：如果对css样式仅进行style-loader和css-loader的处理
将不会生成单独的css文件，而是通过js将样式注入到style标签中然后挂载在页面头部，这也是我们看到很多组件只打包了js文件也能渲染样式的原因，
但是浏览器不会对style标签内的内容进行缓存，所以对于大型项目来说，这种方式对于页面加载的性能非常不利；
- extract-text-webpack-plugin:该插件可以将css样式抽离成单独的文件，并且可以支持多样式文件的处理，但是这种打包不能做到按需加载，比如说在一个
js文件中有对其他样式的引用，那所有的样式会在js执行之前便会被打包到bundle.css中，但是在当前页加载时这部分资源并没有被用到；
- mini-css-extract-plugin: 该插件可以实现按需加载css,被动态依赖的css资源将会被打包成单独的资源，并通过js动态插入link标签的方式加载
- 样式预处理：通过sass，scss和less可以实现更丰富且强大的css写法
- post-css：搭配post-css会让autoprefixer实现针对环境进行定制化的css代码构建
- css-modules: 当css被放置在不同文件中维护，或者css样式内容变得非常庞大时，极有可能会出现样式冲突的情况，css-modules便是针对这个情况通过文件名，样式名，hash值生成
唯一的类名，解决命名冲突，只需要在css-loaders中将options.module设置为true即可

### 代码分片

代码分片的目的可以简单理解为将公用模块抽离，打包成单独的文件，这样针对业务代码的变更不会影响到公用模块的加载，提升页面资源加载的性能；
书中介绍了CommonsChunkPlugin插件和optimization.SplitChunks配置两种方案

#### 最初的分离方案

```
// webpack.config.js
{
  entry: {
    app: './app.js',
    lib: ['lib-a', 'lib-b', 'lib-c']
  }
};

//index.html
<script src="dist/lib.js"></script>
<script src="dist/app.js></script>
```
简单的将公用模块和业务模块打成两个bundle，这导致两个模块不在一个依赖树上，仅适用于公用模块注册在全局变量的场景

#### CommonsChunkPlugin

```
const webpack = require('webpack');

module.exports = {
  entry: {
    foo: './foo.js',
    bar: './bar.js'
  },
  output: {
    filename: '[name].js'
  },
  plugin: [
    new webpack.optimize.CommonsChunkPlugin({
      name: 'commons',
      filename: 'common.js'
    })
  ]
};
```
- 目的：可以将公用模块抽离在common.js中，并且业务模块和公用模块在统一依赖树上
- 设置提取规则：对于一些组件和工具模块，虽然多次引用，但是会经常修改，这些并不能作为公用模块进行处理，所以需要对
提取的规则进行设置，CommonsChunkPlugin可以支持根据引用次数和引用路径对文件进行识别，进而实现定制化的提取
- hash和长效缓存：webpack在进行打包是，运行时的代码（诸如模块id，环境代码等）也将会打包进公用模块，但是这部分代码
在业务代码变更时，也会造成公用模块中的代码变更，比如在业务代码中添加一个模块后，公用模块的模块id也会受到影响，所以此时可以
通过配置manifest实现webpack运行时代码的抽离
- 缺陷：CommonsChunkPlugin不能进行异步加载模块的提取

#### optimization.SplitChunk

利用optimization.SplitChunk可以实现异步加载模块的提取，而且这种配置是声明式的，相比与CommonsChunkPlugin命令式的配置更加强大（
我的理解：命令式是明确的指定了文件的名字或者路径，而声明式是制定了一系列规则，符合规则的将被提取）
optimization.SplitChunk可以支持的配置
- 指定文件大小，设置文件下限，超过该体积的文件才能够被提取为公用模块
- 指定应用次数，超过一定次数的模块才能被提取
- 首页请求并发次数
- 按需加载并发次数（异步加载的资源会通过script标签的方式异步加载，每次链接创建都要消耗加载的成本，所以需要针对这个做上限设置）

### 打包优化

- 多线程打包HappyPack: 可以开启多个线程，并行地对不同模块进行转译
- 缩小打包作用域：
    - exclude和include：过滤打包文件
    - noParse:会将模块打入包中，但不会进行任何处理
    - cache: 配置loader缓存，编译前会检查原文件是否有变化，没有会直接采用缓存
    
    tree-shaking: 死代码检查，去除永远无法执行的代码


后面还有样式处理，代码分片，生产环境配置，打包优化，开发环境调优的介绍

### 关于性能优化和一些开发技巧
以下是我整理的在日常开发中可以利用的技巧
- url-loader:对图片的加载可以利用url-loader，设置文件size阈值，在该阈值内的图片都会被打包成base64
这样可以提升图片的加载性能，之前的开发时都会在代码中写base64，会令代码难以维护；
- vendor.js:对于第三方模块的依赖可以单独打成一个vendor.js，这部分代码极少会有变动，这样在代码有更新时，就不需要
重新加载第三方依赖模块生成的代码
- npm本地开发实践：之前在对npm包代码改动时，都是在node_module中直接修改代码，然后把代码拷到npm源代码，这样做
其实非常蠢，而且容易出错，有个简单的命令在这里分享下
```
npm install <path-to-loader>/your-repo
```
这行命令可以把本地文件安装到node_module目录下，并生成一个软链，这样对于npm源代码的改动直接会在node_module目录下生效
