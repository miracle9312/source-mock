## js设计模式

### js面向对象设计
<img style="margin: auto;display: block;" src="https://pt-starimg.didistatic.com/static/starimg/img/O5e0naDpUB1630832522867.png" width="500px" height="250px"/> 

### 单例模式

#### 定义

* 暴露一个全局访问点
* 一个类只有一个实例

#### 实现

```js
var singleCreate() = (function {
  let instance;// 利用闭包缓存已实例化过的实例
  let SingleObj = function() {
    if(instance) {// 如果存在已实例化的实例则直接返回
      return instance
    }
    this.init()
    return instance = this// 如果不存在则返回当前实例
  }
  
  SingleObj.prototype.init = function() {}
})()
```
#### 思考
> 关于全局组件优化的思考

当前我们业务开发中经常使用的通用组件，position,login,share等都有可能在代码中被多次实例化，但是这些全局组件只需要引用同一个实例，虽然目前不太可能造成对象爆炸的情况，但是更合理的方式应该是通过单例实现，这里代理的方式去做一个单例的通用方案，后续可以优化时引入

```js
// 假设以下是我们的获取定位组件
let Position = function(){}
Position.prototype.init = function() {}


// 通过ProxySingleCreator代理调用单例，不用侵入Position源代码改造
let ProxySingleCreator = (function(){
  let instance;
  
  return function(Cls, options) {
    if(!instance) {// 每次生成一个实例
      instance = new Cls(options)
    }
    return instance
  }
})()

var a = new ProxySingleCreator(Position, {})
```
以上方式以比较通用的方式实现全局组件的单例模式

> 关于全局变量污染的思考

单例模式的暴露全局方式通常会使用全局变量来实现，但是在大型项目中可能出现全局变量污染，其实可以通过命名空间的方式进行改造，改造方式如下

``` js
let KUI = {}
KUI.namespace = function(name) {
  var part = name.split('.')
  var current = KUI;
  for(var i in part) {
    // 可以在这里顺便定义资源引用
    if(!current[parts[i]]) {
      current[parts[i]]= {}
    }
    current = current[parts[i]]
  }
}

KUI.namespace('position')
KUI.namespace('login')
```

通过以上这种以命名空间访问全局变量的方式，可以支持多层嵌套，并且可以很好的拓展资源的按需引用

> 关于全局弹窗,loading的实现

星聚项目目前正在考虑去做全局弹窗和loading，本质上这两个组件都是单例组件，虽然vue中通过keep-alive实现了node的缓存，在一定程度上可以利用该特性去做vnode生成计算的优化，但是本质上的dom生成还是要重走一遍，下面以伪代码的方式去大致设计下弹窗组件的实现方案（loading同理）

``` js
// 创建弹窗
function renderComponentToHtml () {}// 创建弹窗html

let createPopup = (function() {
  var html;
  return function(Component) {
    html = html || renderComponentToHtml()// 保证生成渲染弹窗dom只有一次
    html.append(Component)
  }
})()

// 将创建弹窗过程封装到vue原型属性，方便所有组件实例内部可以直接调用
Vue.prototype.$createPopup = createPopup

```

### 策略模式

#### 定义
 封装一系列算法，算法之间可以相互替换，本质上是一个非常好的去if/else分之判断的方式

#### 实现
策略模式在之前对定位弹窗的优化中有过应用，背景是在当前对定位弹窗管控，在定位获取失败时展示反馈确认弹窗，引导用户操作，但是这个这个反馈弹窗业务线展示会不相同，点击后的反馈也不一样；以下通过一个简化版的伪代码去分解实现

```js
// 封装策略对象
let strategies = {
  wx: {
    daijia: function() {
      console.log('展示代驾弹窗')
    },
    freight: function() {
      console.log('展示货运弹窗')
    },
    htw: function() {
      console.log('展示两轮车弹窗')
    },
  }
}

function getPlatform() {
  // 获取当前环境
  return platform// daijia, freight, htw
}

function showPopup(){
  strategies[getPlatform()]()
}
```

以上将不同的弹窗展示逻辑封装在一个策略对象，对比if/else更容易扩展和维护，并且更语义化

#### 应用及思考

最近星云发布确认页的开发设计方案中也可以对策略模式有一个非常好的应用，发布确认页需要校验权益，活动配置相关的规则，这些规则全部可以封装成独立的策略，在提交时同一校验返回结果，以下通过伪代码的方式去实现

```js
let strategies = {
  isRightsTimeValid (value, msg) {
    return {
      valid: true,
      msg: ""
    }
  },
   isActvityTimeValid (value, msg) {
    return {
      valid: true,
      msg: ""
    }
  }
}

// 定义校验类
var Validator = function() {
  this.cache = []
}

Validator.prototype.add = function(strategy,value, msg) {
  // 向cache中插入一项校验
  this.cache.push(function(){
    return strategies[strategy].apply(value, msg)
  })
}

Validator.prototype.start = function() {
  for(var strategy in this.cache) {
    let res =strategy()
    return res
  }
}
// 实际调用

let validFunc = function() {
  let validator = new Validator()
  validator.add('isRightsTimeValid','11', 'fail')
  return validator.start()
}

// 点击时去做校验
submitBtn.onclick = validFunc()

```

### 代理模式

#### 定义：
通过一个替身去访问另一个对象，实现对象之间访问解耦

#### 实现

```js
let Sender =  {
  send() {
    Proxy.receive('message')
  }
}

let Proxy = {
  receive(msg) {
    Receiver.receive(msg)
  }
}

let Receiver = {
  receive(msg) {
    console.log('i got you' + msg)
  }
}

Sender.send('love u')

```

#### 思考
以上的代码乍一看感觉proxy多次一举，但是可以在Proxy中去做一些访问的处理，访问的处理可以总结为两种方式
保护代理： 接收者不直接处理访问拒绝，在代理中去做拒绝访问，这种思想其实在服务端的网关实现中有很好的体现，访问具体服务前在网关层做签名校验，不通过请求不需要进到业务服务中
虚拟代理：在接收者可以处理请求时，才执行真正的请求，MQ其实简介利用了这个模式，mq会堆积请求队列，在业务侧希望消费时，把请求扔给业务侧

> vue中proxy的应用

vue中的data实际声明在vm._data下，但是我们实际访问时可以通过vm.xxx直接访问，本质上是通过defineProperty实现了代理模式

### 职责链模式

#### 定义
将一系列可能处理请求的对象连接成一条链，请求在这条链上的对象进行传递，直到遇到能处理它的请求

#### 实现

下面通过优质男青年征哥在鱼塘通过职责链寻找白富美对象的例子去解释，假设现在征哥鱼塘里有四条鱼，这四条鱼在看到征哥时都会问自己三个问题，我美吗，富吗，白吗，当这几个问题同时满足时，这条鱼会非常明确自己符合要求，并且成功转化征哥，如果答案是否定的，就会把征哥让给下一条鱼处理。假设我们这里的四条鱼分别叫小白，小富，小美，白富美
假设在每个对象问自己是不是富时，会先去查下自己的银行账户，这里就会涉及到异步调用的问题，所以我们完整职责链设计需要支持异步流转
```js

// 定义职责（鱼塘）链
function Chain(fn) {
  this.fn = fn
}

// 设置下一个执行的对象
Chain.prototype.setNextSuccessor = function(successor) {
  this.successor = successor
}

// 执行职责链对象方法
Chain.prototype.passRequest = function() {
  let ret = this.fn.apply(this, arguments)
  if(this.ret = 'nextSuccessor') {
    ret = this.successor && this.successor.passRequest.apply(this.successor, arguments)
  }
  
  return ret
}

// 用于处理异步职责
Chain.prototype.next = function() {
  return this.successor && this.successor.passRequest.apply(this.successor, arguments)
}

// 职责1
const fish1 = new Chain(function({bai, fu, mei}){
  if(bai && !fu && !mei) {
    console.log('i am yours')
  }else {
    return 'nextSuccessor'
  }
})

const fish1 = new Chain(function({bai, fu, mei}){
  const that = this;
  setTimeout(function(){
    const myMoney = 1000000000
    if(fu) {
      if(fu.money > myMoney) {
        that.next()
      }else {
        console.log('i am yours')
      }
    }
  }, 1000)
})

const fish1 = new Chain(function({bai, fu, mei}){
  if(mei && !fu && !bai) {
    console.log('i am yours')
  }else {
    return 'nextSuccessor'
  }
})

const fish1 = new Chain(function({bai, fu, mei}){
  const that = this;
  if(mei && bai && fu) {
    setTimeout(function(){
    const myMoney = 1000000000
    if(fu) {
          if(fu.money > myMoney) {
            that.next()
          }else {
            console.log('i am yours')
          }
      }
    }, 1000)
  }else {
    that.next()
  }
})

fish1.setNextSuccessor(fish2).setNextSuccessor(fish3).setNextSuccessor(fish4)

fish1.passRequest()
```

#### 应用

node中间件模式设计

当看到职责链模式时，不由得会让人联想到node框架中的中间件模式的设计，按我的理解，中间件模式本质上是职责链模式的封装，在函数作为js语言一等公民的背景下把函数直接作为职责对象，并在职责链上通过队列进行保存，暴露基础api添加职责对象。首先来看下express中中间件模式的使用

>express中的实现

```js
const express = require('express')
var app = express()

app.use(function(req, res, next){
  console.log('日志采集');
  next()
})

app.use(function(req, res, next){
  console.log('数据统计');
  next()
})

app.get('/', function(req, res, next){
  console.log('hello world');
  res.send()
})

```

上述的过程express的实现可以简化如下
```js
const Middleware = function() {
  this.middlewares = []
}

Middle.prototype.use = function(fn) {
  if(typeof fn !== 'function') {
    throw new Error('middleware must be a function')
  }
  
  this.middleName.push(fn)
  // 返回实例，便于链式调用
  return this
}

Middleware.prototype.next = function() {
  if(this.middlewares && middlewares.length) {
   const middleware = this.middlewares.shift();
   middleware.call(this, this.next.bind(this));
  }
}

Middleware.prototype.handleRequest = function() {
  this.next()
}

```

虽然中间件模式是由职责链模式演化而来，但是中间件模式通常应用在对统一上下文的改造，next中通常会将上下文req和res在调用队列中进行传递

> koa中的实现

```js
const koa = require('koa')
const app = koa()

app.use(async(ctx, next) => {
  console.log('m1 start')
  next && await next()
  console.log('m1 end')
})

app.use(async(ctx, next) => {
  console.log('m2 start')
  next && await next()
  console.log('m2 end')
})

app.use(async(ctx) => {
  console.log('m3 start')
  console.log('m3 end')
})

app.listen(8080)
```

上述这段的代码的输出顺序如下
> m1 start
m2 start
m3 start
m3 end
m2 end
m1 end

以上就是非常经典的洋葱模型，本质上koa中间件模式是通过递归实现的

```js

const compose = function(middlewares) {
  return function() {
   function dispatch(i) {
     if(!middlewares.length) return Promise.resolve()
     return Promise.resolve(middlewares[i] && middlewares[i](ctx, ()=>dispatch(i+1)))
   } 
   return dispatch(0)
  }
}

```

本质上无论是职责链模式还是中间件模式，实现的本质都是将函数组织在一个队列中，通过显示的next去处理对象中的调用顺序，而这个调用权的开放跟迭代器模式中的外部迭代器在思想上有着高度的一致性


### 模板方法模式

#### 定义

抽象父类封装子类算法框架，公共方法封装子类所有方法执行顺序

#### 举个生动的例子

星聚开发即模板中一个应用的例子，工程中存在模板和组件这样两类对象，对于这两类对象我们很多的处理逻辑会非常相似，虽然基于通用脚手架的钩子我们处理了这层通用逻辑，但是如果我们从头开始实现的话，会抽象出一个通用父类，对两类对象的通用方法进行抽象。比如在工程初始化的过程中我们的流程会是下载文件->变量替换->输出文件->包安装，那下面会用传统静态语言类继承的方式和利用js特性的当时分别去实现

类继承

```js

// 抽象父类
const InitProject = function() {
}

InitProject.prototype.download = function() {
  console.log('download the file')
}

InitProject.prototype.replaceVal = function() {
  console.log('replace the value')
}

InitProject.prototype.output = function() {
  console.log('output the file')
}

InitProject.prototype.install = function() {
  console.log('install the project')
}
InitProject.prototype.init = function() {
  this.download();
  this.replaceVal();
  this.output();
  this.install();
}

// 模板工程类
const TemplateInit = function(){}

TemplateInit.prototype = new InitProject()

TemplateInit.prototype.download = function() {
  console.log('download the template')
}

TemplateInit.prototype.replaceVal = function() {
  console.log('replace the template')
}

TemplateInit.prototype.output = function() {
  console.log('output the template')
}

TemplateInit.prototype.install = function() {
  console.log('install the template')
}

const templateTool = new TemplateInit()
templateTool.init()

// 组件工程类
const ComponentInit = function(){}

ComponentInit.prototype = new InitProject()

ComponentInit.prototype.download = function() {
  console.log('download the component')
}

ComponentInit.prototype.replaceVal = function() {
  console.log('replace the component')
}

ComponentInit.prototype.output = function() {
  console.log('output the component')
}

ComponentInit.prototype.install = function() {
  console.log('install the component')
}

const componentTool = new ComponentInit()
componentTool.init()

```

> js 对象

下面简化后通过js对象的方式去实现
```js
// 抽象父类
const InitProject = function(params) {
  const download = params.download || function (){ throw new Error('must download')}
  
  const output = params.output || function (){ throw new Error('must output')}
  
  download();
  output();
}

const TemplateInit = InitProject({
download: function() {
  console.log('download the template')
},
output: function() {
  console.log('output the template')
}
})

TemplateInit()

const ComponentInit = InitProject({
download: function() {
  console.log('download the component')
},
output: function() {
  console.log('output the component')
}
})

ComponentInit()

```

### 命令模式

#### 定义
利用将具体执行方法封装到命令中，将接收者和访问者进行解耦

* 命令安装
* 命令接受着定义
* 命令调用者定义
* 撤销和前进功能

#### 实现

```js
// 待补充
```

#### 思考

> 如何通过命令模式实现星云的撤销前进功能

### 迭代器模式

#### 定义
提供方法顺序访问一个聚合对象中的各个元素

内部迭代器：定义好访问规则
外部迭代器：显示请求下一个元素
中止迭代器：提供跳出循环的方法

### 实现
```js
let each = function(arr, callback) {
  for(let i = 0;i< arr.length; i++) {
    callback(arr[i], i, arr[i])
  }
}
each([1,2,3], function(i, n) {
  console.log(i, n)
```
js内部其实已经实现了迭代器模式如Array.prototype.forEach，以上通过回调的方式又实现了一遍

### 发布订阅模式

#### 实现
* 事件队列
* 事件订阅
* 事件发布

#### 思考

> 发布订阅模式在promise,vue,vuex中的应用

### 享元模式

#### 定义
利用共享的思想支持大量细粒度的对象，在js中防止对象爆炸有非常广的应用
#### 实现
* 拆分内部状态
* 拆分外部状态
```js
```

#### 思考
> 如何利用享元模式去实现一个星云的文本框组件


### 中介者模式

#### 定义

解除所有对象之间的直接联系，通过中介者统一管理，将多对多的对象关系转化为一对多，使其符合最少知识原则

#### 思考

星聚搭建引擎侧可插拔的模块设计方案是基于中介者模式实现的

### 装饰器模式

#### 定义
不改变对象的基础上，程序运行期间动态给对象添加职责

#### 思考

Vue中prototype传递其实就是基于装饰器模式实现的





