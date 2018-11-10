```js
var promiseObj = new Promise(function(resolve, reject){ 
  setTimeout(function(){ 
    resolve('to then1');
    }, 1000); });
promiseObj.then(function(val){
  console.log(val);
  return 'to then2'; 
}).then(function(val){ 
  console.log(val); 
});
```
以上是一段简单的promise处理异步操作的代码，初始化中有一个包含setTimeout异步操作的函数，在两个then中定义了两个异步操作后的执行函数;promise的作用是实现在异步操作完成之后去触发then中声明的函数，以取代之前不断定义callback的方式，将异步操作通过同步的写法实现，使得程序书写符合开放封闭原则；整个的实现过程分这么几步：

promise实例化
Promise.prototype.then()创建promise链
resolve递归触发promise链
一、Promise的实例化以及一些工具函数

以下是接下来将用到的几个工具函数，其作用已经在注释中说明
```js
//声明一个空函数，用于初始化一个没有执行逻辑的promise
    var noop = function(){};

    var IS_ERROR = {};
    var LAST_ERROR = null;

    //将a作为fn的参数进行执行
    function tryCallOne(fn, a) {
        try{
            return fn(a);
        }catch(e){
            LAST_ERROR = e;
            return IS_ERROR;
        }
    }

    //将a, b作为fn的参数执行
    function tryCallTwo(fn, a, b) {
        try{
            return fn(a, b);
        }catch(e){
            LAST_ERROR = e;
            return IS_ERROR;
        }
    }
```
以下是promise的构造函数
```js
function Promise(fn) {
        /*
        * _deferredState：用于指示promise是否添加过deferred
        * _deferred:延迟对象原型是Handler
        * _state:promise执行状态pengind:0,fulfilled:1
        * _value:defered函数执行参数*/
        this._deferredState = 0;
        this._deferred = null;
        this._state = 0;
        this._value = null;
        doResolved(this, fn);
    }
```
其中_deferred对象包含一个promise对象和then中定义的执行成功(resolved)和执行失败(rejected)时的延迟执行函数，相当于是promise的一个链条，其构造函数是如下所示的Handler
```js
//我是deferred对象的构造函数
function Handler(onFulfilled, onRejected, promise) {
        this.onFulfilled = typeof onFulfilled === 'function'? onFulfilled: null;
        this.onRejected = typeof onRejected === 'function'? onRejected: null;
        this.promise = promise;
    }
```
其他几个属性已经在注释中说明，实例化的第一步就是要执行doResolved函数了，promise在实例化时会传入一个包含异步操作的函数暂时称之为fn，在这个函数中包含两个参数，这两个参数就是执行成功或失败时用来调用then中函数的函数（有点绕口哈哈）；而doResolved的作用就是为这个fn传入这两个参数而生的。
```js
function doResolved(self, fn) {
        tryCallTwo(fn, function(val){
            resolve(self, val);
        },function(val){
            reject(self, val);
        });
    }
```
以上就是promise实例化的全过程了

二、promise.prototype.then的原理

then的作用实际是为了创建一个promise链，先将then中声明的函数包在promise1中，再返回一个没有执行逻辑的promise2,然后将后一个then中声明的函数包在promise2中，如此构造一个promise链
```js
Promise.prototype.then = function(onFulfilled, onRejected){
        var res = new Promise(noop);//一个没有执行逻辑的空promise
        handle(this, new Handler(onFulfilled, onRejected, res));//包一个promise在当前promise中
        return res;
    };
```
Handler在之前已经提到过，接下来看看handle这个函数都干了啥
```js
//将原始的promise对象构造为一个包含子promise的链式promise
    function handle(self, deferred) {
        if(self._deferredState === 0){
            self._deferredState = 1;
            self._deferred = deferred;
            return;
        }
    }
```
handle函数传入两个参数，一个是promise本身，另一个是包含一个没有处理逻辑的空promise的deferred对象，整个的处理逻辑就是将deferred对象赋给promise的deferred属性，然后再将_deferredState切换为1，指示promise已添加过deferred对象。说白了，handle就是给声明的promise添加一个包含空promise的deferred对象，再由then函数返回这个空promise。如此构成一个层层包裹的promise链。

三、resolve&reject
```js
function reject(self, newValue){
    self._state = 2;
    self._value = newValue;
    if(self._deferredState === 1){handleResolved(self, self._deferred);}
}

function resolve(self, newValue){
    self._state = 1;
    self._value = newValue;
    if(self._deferredState === 1){handleResolved(self, self._deferred);}
}
```
resolve和reject两个函数记录下外部传来的参数，并将promise的状态记录在_state属性中，供接下来的handleResolved函数触发promise链用。

四、handleResolved
```js
function handleResolved(self, deferred) {
    asap(function(){
        var cb = self.state === 1 ? deferred.onFulfilled : deferred.onRejected;
        var ret = tryCallOne(cb, self._value);
        resolve(deferred.promise, ret);
        return;
    })
}
```
首先handleResolve本质是一个递归函数，结束条件是self._deferredState !== 1，即终止到未挂载deferred对象的子promise为止。另外执行deferred对象内部函数的代码包裹在asap模块中，asap模块相当于一个插队作用，包含在其中的任务会在当前线程的所有排队任务队列全部执行完后执行，但又会在新线程之前执行即setTimeout中的任务之前。之前在知乎上看到关于该问题的讨论，真相就是这个asap了。可以看到这个handleResolved函数的作用就是根据_state属性逐个触发promise链中的onFulFilled或onRejected函数。

五、总结

以上是在对promise源码 阅读后，针对promise的几个功能对整体简化之后的代码及总结，之后会根据promise的几个特性完善各个函数，还你一个完整的promise。源码请戳这里。

六、来一道promise测试题
```js
function timeout() {
  var promiseObj = new Promise(function(resolve, reject){
    console.log('1');
    resolve();
  });

  return promiseObj;
}

timeout().then(function(){
  setTimeout(function(){console.log('2')}, 500);
}).then(function(){
  console.log('3')
});

console.log('4');
```
