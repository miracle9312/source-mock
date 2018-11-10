#
## **面向对象**

**多态**：同一操作作用于不同对象，有不同的解释和执行结果

```js
//多态
function Obama(){}
Obama.prototype.sayHello = function(){
  console.log('hello');
}

function Xijinping(){};
Xijinping.prototype.sayHello = function(){
  console.log('你好');
}

function sayHi(leader){
  leader.sayHello();
}

sayHi(new Obama(),'多态');
sayHi(new Xijinping(), '多态');
```

**封装**：js支持封装数据，并不支持封装类型

* 实现：闭包实现
* 场景：为了避免全局变量污染需要设置一个属性，外界访问不到属性本身，只能靠暴露方法进行访问和修改

```js
var myObject = (function(){
  var myProperty = 'handsome';
  return{
    getProperty:function(){
      return myProperty;
    },

    setProperty: function(pro) {
      myProperty = pro;
    }
  }
})();

myObject.setProperty('ugly');
console.log(myObject.getProperty(),'封装');
```

**继承**：基于原型链的继承

* 构造函数创建对象过程
* 在Object.prototype上克隆一个对象
* 将该对象指向正确的原型
* 为对象设置属性
* 返回对象
* 理解原型和原型对象的区别

**this,call,apply**

this的指向问题

* 作为对象的方法调用
* 普通函数调用
* 匿名函数中的this
* 箭头函数中的this

call,apply改变this的指向

### **闭包和高阶函数**

#### **闭包的作用**

* 封装变量
* 延长生命周期

```js
//闭包实现生成不重复随机数
var createRandom = (function(){
  var cache = [];
  var produceRandom = function(){
    return Math.ceil(Math.random()*10);
  };
  return function(){
    var ranVal = produceRandom();
    while(cache.indexOf(ranVal) > -1){
      ranVal = produceRandom();
    }

    cache.push(ranVal);
    return ranVal;
  }
})();

for(var i=0;i<10;i++){
  console.log(createRandom(),'不重复随机数')
```

#### 高阶函数

* **高阶函数实现aop**：ajax请求前的表单验证，统计代码

```js
//高阶函数实现aop
Function.prototype.before = function(beforefn){
  var _self = this;
  return function(){
    beforefn.apply(_self,arguments);
    return _self.apply(_self);
  }
}

var func = function(){
  console.log('existing','aop');
};

func = func.before(function(){
  console.log('before','aop');
});

func();
```

* **惰性加载函数**：在一些经常被调用的库函数中，经常出现一些判断ua执行操作的方法，用if可能会造成每次调用都需要进入if分支，用惰性加载函数可以避免该问题
* **节流函数**：避免频繁操作
* **函数柯里化**

```js
//函数柯里化
var curring = (function(fn) {
  var args = [];

  return function(){
    if(arguments.length === 0){
      fn.apply(this, args);
    }else{
      [].push.apply(args, arguments);
    }
  }

});

var cost = (function(){
  var money = 0;

  return function(){
    for(var i=0, l=arguments.length; i<l; i++){
      money+=arguments[i];
    }

    return money;
  }
});

cost = curring(cost);

cost(100);
cost(200);
console.log(cost(),'curring calculate');
```

### **设计模式**

#### 1、**单例模式**

场景：保证一个类只有一个实例，如_**问卷系统**_的配置页面每次打开都会出现一个弹出框，每次重新编辑弹出框时都会开启和关闭弹出框，如果不用单例模式处理会出现重复创建和挂载dom对性能会有所影响

方式一：

```js
var createEditTemplate = function(){
  var div = document.createElement('div');
  div.innerHTML = '问卷系统';
  div.style.display = 'none';
  div.id = 'editTemplate';
  document.body.appendChild(div);

  return div;
};

var editTemp = createEditTemplate();

document.getElementById('openBtn').onclick = function(){
  editTemp.style.display = 'block';
};

document.getElementById('closeBtn').onclick = function() {
  editTemp.style.display = 'none'
};
```

问题：出现全局变量，js的全局变量实际上时设计上的失误，应该尽量避免出现全局变量的出现，于是出现了方式二

方式二：

```js
var createEditTemplate = function(){
  var div = document.createElement('div');
  div.innerHTML = '问卷系统';
  div.style.display = 'none';
  div.id = 'editTemplate';
  document.body.appendChild(div);

  return div;
};

document.getElementById('openBtn').onclick = function(){
  var editTemp = createEditTemplate();
  editTemp.style.display = 'block';
};

document.getElementById('closeBtn').onclick = function() {
  document.getElementById('editTemplate').style.display = 'none';
};
```

问题：每次开启对话框都会重新创建dom，挂载dom，于是出现方式三单例模式

方式三：

```js
//对象创建方法
var createEditTemplate = function(){
  var div = document.createElement('div');
  div.innerHTML = '问卷系统';
  div.style.display = 'none';
  document.body.appendChild(div);

  return div;
};

//单例管理方法
var getSingle = function(fn){
  var result;
  return function(){
    return result = result || fn.apply(this, arguments);
  }
};

var createSingleEditTemplate = getSingle(createEditTemplate);

document.getElementById('openBtn').onclick = function(){
  var obj = createSingleEditTemplate();
  obj.style.display = 'block';
};
```

以上方式有两个好处

1. 可以避免声明全局变量带来的变量污染问题
2. 不需要每次在打开页面时就重新创建dom和挂载dom

#### 2、**策略模式**

场景：在_**代驾司机端**_，我们组件库中有一个表单验证的组件，简单起见我们仅为这个组件添加手机号，邮箱，字母验证功能，开始我们用if分支来进行管理

```js
var validateMobile = function(val){
  console.log('正在验证手机号');
};

var validateEmail = function(val){
  console.log('正在验证邮箱');
};

var validateAlpha = function(val){
  conosle.log('正在验证字母');
};

var validate = function(method, val){
  if(method === 'mobile'){
    validateMobile(val);
  }

  if(method === 'email'){
    validateEmail(val);
  }

  if(method === 'alpha'){
    validateAlpha(val);
  }
};
```

问题：如此庞大的if分支无疑增加了后期代码的维护所以此处引入了策略模式进行管理

```js
var validateMobile = function(val){
  console.log('正在验证手机号');
};

var validateEmail = function(val){
  console.log('正在验证邮箱');
};

var validateAlpha = function(val){
  conosle.log('正在验证字母');
};

//策略对象
var strategies = {
  validateAlpha:validateAlpha,
  validateEmail:validateEmail,
  validateMobile:validateMobile
};

var validate = function(method, val){
  strategies[method].apply(this, val);
};
```

#### 3、**代理模式**

场景：分保护代理和虚拟代理

* 保护代理：有对象A和代理对象B，请求通过代理B过滤，对象A只处理部分请求
* 虚拟代理：把一些开销很大的对象延迟到真正需要他的时候才创建

用代理模式实现图片预加载

```js
var myImage = (function(){
  var imgNode = document.createElement('img');
  document.body.appendChild(imgNode);
  var img = new Image();

  img.onload = function(){
    imgNode.src = img.src;
  }

  return function(src) {
    imgNode.src = 'test.jpg';
    img.src = src;
  }
})();
```

起初我们会这么干，但这个myImage对象包含了两个功能，一个是预加载，一个是图片设置，不符合单一原则，给后期维护带来难度，引入代理模式进行优化

```js
var myImage = (function(){
  var imgNode = document.createElement('img');
  document.body.appendChild(imgNode);

  return {
    setSrc: function(src){
      imgNode.src = src;
    }
  }
})();

var proxyImage = (function(){
  var img = new Image();

  img.onload = function(){
    myImage.setSrc(img.src);
  }

  return {
    setSrc: function(src) {
      myImage.setSrc('test.jpg');

      img.src = src;
    }
  }
})();
```

#### 4、**迭代器模式**

场景：实现一个jquery的$each方法

```js
var each = function(arr,fn){
  for(var i=0;i<arr.length;i++){
    fn.call(arr[i],arr[i],i);
  }
};

each([1,2,3],function(item,i){
  console.log(item.i);
});
```

#### 5、**发布－订阅模式**

场景：异步编程等

```js
//观察者
var interview = {};

interview.handlers = [];

interview.listen=function(fn){
  this.handlers.push(fn);
};

interview.trigger = function(){
  for(var i=0; i<this.handlers.length; i++){
    this.handlers[i]();
  }
};

interview.listen(function(){
  console.log('我叫小明，订了一套海景房');
});

interview.trigger();
```

#### 6、**命令模式**

场景：

* 将命令请求者和接受者进行解耦，在具体工作中可以通过部分人专注页面的开发，部分人专注业务逻辑的书写，再通过命令模式建立两者的联系。

* 可以利用命令模式实现撤销，重做等功能，当对象执行一系列不同的操作，现在需要保存这些操作并适时全部触发，利用命令模式可以将这些操作进行统一封装，放入缓存队列，遍历触发。由于命令模式的统一封装，触发变得尤为简单。

实现：四个主体，命令请求者，命令接受者，命令对象，设置命令函数，命令对象是命令接受者执行命令的一种封装，有触发命令执行的**统一接口**。

```js
//命令模式 撤销重做
var actor = {
  "cry": function(){console.log('crying')},
  "smile": function(){console.log('smile')},
  "laugh": function(){console.log('laugh')},
  "sad": function(){console.log('sad')}
};

var commands = {
  "119": "cry", //w
  "115": "smile", //s
  "97": "laugh", //a
  "100": "sad" //d
};

//创建命令对象 实际为一个返回的匿名函数
var ActCommand = function(receiver, keycode){
  return function() {
    receiver[keycode]();
  }
};

var commandStack = []; //命令栈

document.onkeypress = function(evt){
  var actCommand = ActCommand(actor, commands[evt.keyCode]);
  if(actCommand){
    actCommand();
    commandStack.push(actCommand);
  }
};

var replayBtn = document.getElementById('replay');
replayBtn.onclick = function(){
  var command;
  while(command = commandStack.shift()){
    command();
  }
};
```

#### 7、**组合模式**

场景：对象之间有层级关系，组合对象触发命令，叶对象全部触发；如dom中的事件触发，所有子节点都会被触发相同的事件

实现：所有对象对于某一指令有相同的触发方法；组合对象中的方法使子节点触发方法，叶对象触发本身方法

```js
//组合模式 模拟文件夹
function Folder(name) {
  this.name = name;
  this.files = [];
}

Folder.prototype.add = function(file) {
  this.files.push(file);
};

Folder.prototype.scan = function() {
  for(var i = 0,file, files = this.files; file = files[i]; i++){
    file.scan();
  }
};

function File(name) {
  this.name = name;
}

//避免叶对象添加误操作
File.prototype.add = function() {
  console.log('文件没有添加操作');
};

File.prototype.scan = function() {
  console.log('正在扫描' + this.name);
};

var folder1 = new Folder('js');
var folder2 = new Folder('node');
var folder3 = new Folder('html');

var file1 = new File('js高级');
var file2 = new File('nodejs');
var file3 = new File('html5权威指南');

folder1.add(file1);
folder2.add(file2);
folder1.add(folder2);
folder3.add(file3);

folder1.scan();
```

#### 8、**模板方法模式**

模板方法

* 场景：多个类在初始化时有相同的执行过程，但具体步骤在执行中又有所不同，可以定义一个共同的抽象类，所有类都重写抽象类的方法。对应具体场景，如代驾中的代叫功能，有商户代叫，司机代叫两种，代叫的执行过程 输入号码-&gt;指定乘客人数-&gt;下单-&gt;查看订单状态；但在具体执行时，商户和司机代叫又有不同显示和执行，就可以应用该模式
* 实现：定义抽象类，描述执行过程的抽象及具体过程，定义具体类，重写抽象类，执行模板方法

```js
function JiaoChe() {}
JiaoChe.prototype.call = function() {
  console.log('打电话给司机');
};

JiaoChe.prototype.appointSite = function() {
  throw new Error('子类必须重写父类方法');
};

JiaoChe.prototype.arrive = function() {
  throw new Error('子类必须重写父类方法');
};

JiaoChe.prototype.drive = function() {
  throw new Error('子类必须重写父类方法');
};

//模板方法
JiaoChe.prototype.init = function() {
  this.call();
  this.appointSite();
  this.arrive();
  this.drive();
};

var KuaiChe = function(){};
//继承
KuaiChe.prototype = new JiaoChe();

KuaiChe.prototype.appointSite = function(){
  console.log('车主已经定位');
};

KuaiChe.prototype.arrive = function() {
  console.log('车主已经到达制定位置');
};

KuaiChe.prototype.drive = function() {
  console.log('请系好安全带');
};

var Daijia = function(){};
Daijia.prototype = new JiaoChe();

Daijia.prototype.appointSite = function() {
  console.log('请按导航寻找车主');
};

Daijia.prototype.arrive = function() {
  console.log('请将电动车放入后备箱');
};

Daijia.prototype.drive = function() {
  console.log('请慢速行驶')
};

var kuaiche = new KuaiChe();
kuaiche.init();

var daijia = new Daijia();
daijia.init();
```

#### 9、**享元模式**

场景：解决对象爆炸问题，为性能优化而生的设计模式，并且有两个特点：

* 有外部对象剥离的过程

* 有共享对象的过程

实现：共享对象，创建共享对象工厂方法，对象外部状态管理以及对象新增方法

```js
//享元对象
function Upload(uploadType) {
  this.uploadType = uploadType;
}

Upload.prototype.delFile = function() {
  uploadManager.setExternalState(id, this);

  if(this.fileSize < 3000){
    console.log('file has been removed');
  }

  if(window.confirm('confirm del')){
    console.log('file has been removed and exceed 3000');
  }
};

//创建对象工厂方法
var uploadFatory = (function(){
  var flyWeightObjs = {};

  return function(upt) {
    if(flyWeightObjs.hasOwnProperty(upt)){
      return flyWeightObjs[upt];
    }

    return flyWeightObjs[upt] = new Upload(upt);
  }
})();

//对象管理
var uploadManager = (function(){
//保存外部状态
  var uploadBase = {};

  return {
    add: function(id, uploadType, fileSize, fileName) {
      var flyWeightObj = uploadFatory(uploadType);

      uploadBase[id] = {
        fileSize: fileSize,
        fileName: fileName
      };

      return flyWeightObj;
    },
    setExternalState: function(id, upload){
      var uploadstate = uploadBase[id];

      for(var proper in uploadstate){
        upload[proper] = uploadstate[proper];
      }
    }
  }
})();

//上传文件
function startUpload(innerSt, files) {
  for(var i = 0; i<files.length; i++){
    uploadManager.add(i, files.uploadType, files.fileSize, files.fileName);
  }
}
```

#### 10、**职责链模式**

场景：根据传入的状态，有不同的执行方式，如司机招募页面中，会根据司机的状态不同，返回不同的展示信息，会出现很多的if分支，并且在以后需求变更时，这些if分支就会被更改，运用职责链模式，可以将每个状态织入链中，指定每个节点的后一个执行节点。

实现：

* 方式1:定义各个状态下的执行函数，将函数作为参数创建职责链对像，职责链对象中包含指定下个对象方法，以及职责链执行函数。
* 方式2:通过js aop编程方式实现

```js
//职责链模式 aop版
function orderAop500(orderType, payState, stock) {
  if(orderType === 1 && payState){
    console.log('已交500定金，获得100优惠券aop');
  }else{
    return 'nextSuccessor';
  }
}

function orderAop200(orderType, payState, stock){
  if(orderType === 2 && payState){
    console.log('已交200定金，获得50优惠券aop');
  }else{
    return 'nextSuccessor';
  }
}

function orderAopNormal(orderType, payState, stock){
  if(stock>0){
    console.log('普通购买，无优惠aop');
  }else{
    console.log('库存不足aop');
  }
}

Function.prototype.after = function(fn){
  var self = this;
  return function(){
    var ret = self.apply(this, arguments);

    if(ret == 'nextSuccessor'){
      return fn.apply(this, arguments);
    }

    return ret;
  }
};

var order = orderAop500.after(orderAop200).after(orderAopNormal);
order(1, true, 200);
```

#### 11、**中介者模式**

场景：多个对象之间互相耦合，某一个对象的改变会造成其它对象的改变，这种情况下，每次对象的改变，或者新增对象都会带来很大的难度，比如页面上几个输入框中的输入值会共同影响页面节点的显示状态，这种情况下输入框中某一输入值一改变，就要先去查询其它几个输入框的值的状态，再去改变节点，此时在新增一个输入框，就要对之前几个输入框的代码进行更改。这种情况下引入中介者对象，将各对象的状态进行统一管理，对象的改变和新增只用改变终结者对象中的代码，提高可维护性和降低耦合度

实现：引入中介者，保存所有对象，以及管理对象的方法，暴露管理方法接口用于各对象的调用，其中隐含发布订阅思想，中介者和各对象即是事件的发布者又是事件的订阅者。

```js
var Player = function(name, teamColor){
  this.name = name;
  this.teamColor = teamColor;
  this.state = 'alive';
};

Player.prototype.remove = function(){
  playerDirector.receiveMessage('remove', this);
};

Player.prototype.die = function(){
  this.state = 'dead';
  playerDirector.receiveMessage('dead', this);
};

Player.prototype.lose = function() {
  console.log(this.name, 'you lose the game');
};

Player.prototype.win = function() {
  console.log(this.name, 'you win the game');
}

//创建成员工厂方法
var playerFactory = function(name, teamColor){
  var player = new Player(name, teamColor);

  playerDirector.receiveMessage('addPlayer', player);

  return player;
};

var playerDirector = (function(){
  var players = {};
  var operations = {};

//添加成员
  operations.addPlayer = function(player){
    var teamColor = player.teamColor;

    players[teamColor] = players[teamColor] || [];
    players[teamColor].push(player);
  };

//移除成员
  operations.remove = function(player){
    var teamColor = player.teamColor,
      teamPlayers = players[teamColor] || [];
    for(var i=0; i<teamPlayers.length; i++){
      if(teamPlayers[i] === player){
        teamPlayers.splice(i,1);
      }
    }
  };

//成员阵亡
  operations.dead = function(player){
    var teamColor = player.teamColor,
      all_dead = true,
      teamPlayers = players[teamColor];

    for(var i=0, teamPlayer; teamPlayer=teamPlayers[i++];){
      if(teamPlayer.state !== 'dead'){
        all_dead = false;
        return;
      }
    }

    if(all_dead === true){
      for(var i=0,teamPlayer; teamPlayer = teamPlayers[i++];){
        teamPlayer.lose();
      }

      for(var color in players){
        if(color !== teamColor){
          var otherTeamPlayers = players[color];
          for (var i=0,otherTeamPlayer; otherTeamPlayer = otherTeamPlayers[i++];){
            otherTeamPlayer.win();
          }
        }
      }
    }
  };

  var receiveMessage = function(){
    var message = Array.prototype.shift.call(arguments);
    operations[message].apply(this, arguments);
  };

  return {
    receiveMessage: receiveMessage
  }
})();

var B1 = playerFactory('B1', 'blue');
var B2 = playerFactory('B2', 'blue');

var R1 = playerFactory('R1', 'red');
var R2 = playerFactory('R2', 'red');

B1.die();
B2.die();
```

#### 12.适配器模式

* 场景：解决两个接口不匹配问题
* 实现：重写定义对象，将原对象接口进行改造，之后用新定义对象进行接口适配

#### 13.状态模式

* 场景：司机打车不同状态按钮显示变化，以及按钮功能变化
* 实现
* 初始打车对象，包括dom挂载，事件绑定，打车对象方法定义
* 创建状态类工厂方法
* 定义状态类，触发方法定义

```js
//状态模式
//打车功能
var Dache = function() {
this.button1 = null;
this.button2 = null;

this.waitState = new WaitState(this);
this.appointSiteState = new AppointSiteState(this);
this.calFeeState = new CalFeeState(this);
this.arrivedState = new ArrivedState(this);
this.cancelState = new CancelState(this);

this.curState = this.waitState;
};

Dache.prototype.init = function() {
this.dom = document.createElement('div');
this.dom.innerHTML = '<button id="bill_panel">正在等待上车</button><button id="cacel_bill">取消订单</button>';
document.body.appendChild(this.dom);

this.button1 = this.dom.querySelector('#bill_panel');
this.button2 = this.dom.querySelector('#cancel_bill');

this.bindEvent();
};

Dache.prototype.bindEvent = function() {
var _self = this;
this.button1.onclick = function() {
_self.curState.clickhandler1();
}

this.button2.onclick = function() {
_self.curState.clickhandler2();
}
};

Dache.prototype.beginMarch = function() {
this.button1.innerHTML = '开始行程';
this.curState = this.appointSiteState;
};

Dache.prototype.calFee = function() {
this.button1.innerHTML = '正在计费';
this.button2.innerHTML = '结束行程';
this.button.disabled = true;
this.curState = this.calFeeState;
};

Dache.prototype.arrived = function() {
this.button1.innerHTML = '已结束行程';
this.button2.innerHTML = '开始听单';
this.curState = this.arrivedState;
};

Dache.prototype.cancel = function() {
this.button2.innerHTML = '已取消订单';
this.curState = this.cancelState;
};

//创建状态工厂方法
var stateFactory = function(param) {
var F = function(dcObj) {
this.dcObj = dcObj;
};



for(var proper in param){
F.prototype[proper] = param[proper];
}

return F;
};

//创建状态类
var WaitState = stateFactory({
clickhandler1: function() {
console.log('开始行程');
this.dcObj.beginMarch();
},
clickhandler2: function() {
console.log('不能取消');
}
});

var AppointSiteState = stateFactory({
clickhandler1: function() {
console.log('开始计费');
},
clickhandler2: function() {
console.log('不能取消');
}
});


```

#### **设计原则和编程技巧**

* 单一职责原则：一个对象或函数只负责一个职责，为实现这一原则的设计模式有单例模式
* 最少知识原则：对象之间尽可能少的发生相互作用
* 开放封闭原则：当改变一个程序的功能或给程序新增功能，可以使用增加代码，而不是修改源代码

#### **代码优化点**

* 利用js aop编程统计代码及请求前的表单验证

```js
//将before织入Function
Function.prototype.before = function(beforefn){
var _self = this;
return function(){
beforefn.apply(_self,arguments);
return _self.apply(_self);
}
};

//发送请求
var send = function() {
console.log('正在发送请求','优化');
};

//验证表单数据
var validateData = function() {
console.log('正在验证数据','优化');
};

send = send.before(validateData);

send();
```

* 尽量减少全局变量的使用



