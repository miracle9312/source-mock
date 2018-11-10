Case1:一旦状态改变，就不会再变，任何时候都可以得到这个结果
```js
var promiseObj = new Promise(function(resolve, reject){
    resolve('resolve');
    reject('reject');
});

promiseObj.then(function(val){
    console.log(val);
}).then(null, function(val){
    console.log(val);
});
```

输出：resolve
Promise对象的状态改变，只有两种可能：从pending变为fulfilled和从pending变为rejected。只要这两种情况发生，状态就凝固了，不会再变了，会一直保持这个结果，这时就称为 resolved（已定型）。为了实现这个特性我们在执行resolve或reject之前先给出一个状态完成变量done，用于指示是否已完成状态。
```js
function doResolved(self, fn) {
    var done = false;
    var ret = tryCallTwo(fn, function(val){
        if(done){return;}
        done = true;
        resolve(self, val);
    },function(val){
        if(done){return;}
        done = true;
        reject(self, val);
    });
    if(!done && ret == IS_ERROR){
        done = true;
        reject(self, LAST_ERROR);
    }
}
```
doResolved函数就变成了上面这个样子。最后一段是错误处理，在之后的章节会统一分析错误处理和错误跟踪机制。

Case2:instance resolve
```js
var promiseObj = new Promise(function(resolve, reject){
    resolve('instance resolve');
});

promiseObj.then(function(val){
    console.log(val+'then1')
    return val;
}).then(function(val){
    console.log(val + 'then2')
});
//输出：instance resolvethen1
        instance resolvethen2
```
之前我们考虑的resolve和reject都是异步触发的，这样then函数的挂载发生在resolve触发promise链之前。如果resolve和reject是即时触发，那resolve和reject会在then挂载前触发，但是在promise中依然能通过resolve触发then中的函数。这个特性的实现只要稍稍改写下handle函数就能实现。在deferred对象挂载到promise前，我们先判断state属性的值，如果_state!==0，则直接触发handleResolved函数，在deferred对象未挂载的情形下直接触发。代码实现如下
```js
function handle(self, deferred) {
    if(self._state === 0){
        if(self._deferredState === 0){
            self._deferredState = 1;
            self._deferred = deferred;
            return;
        }
    }

    handleResolved(self, deferred);
}
```
在promise源码中所有handleResolved的调用都通过handle，这样可以是代码更加简练，但实际上并不符合设计的单一原则，handle被赋予了两种以上的功能。为了尊重源码我们resolve和reject函数中对handleResolved的调用换成handle,如下：
```js
function reject(self, newValue){
    self._state = 2;
    self._value = newValue;
    //handleResolved=>handle
    if(self._deferredState === 1){handle(self, self._deferred);}
}

function resolve(self, newValue){
    self._state = 1;
    self._value = newValue;
    //handleResolved=>handle
    if(self._deferredState === 1){handle(self, self._deferred);}
}
```
Case3:同一个promise中含有多条链
```js
var promiseObj = new Promise(function(resolve, reject){
    setTimeout(function(){resolve('instance resolve')}, 100);
});

promiseObj.then(function(val){
    console.log(val+'then1')
});
promiseObj.then(function(val){
    console.log(val + 'then2')
});
```


//输出：instance resolvethen1
      instance resolvethen2
以上的promiseObj中定义了两条链，正常情形下，两条链会依次执行。逐条链的触发实现原理是当检测到有两条及以上的链条时，将链条保存在一个数组中，在触发时遍历数组逐条触发。链条保存到数组在链条挂载操作——handle函数执行时进行处理，代码如下
```js
function handle(self, deferred) {
    if(self._state === 0){
        if(self._deferredState === 0){
            self._deferredState = 1;
            self._deferred = deferred;
            return;
        }
        if(self._deferredState === 1){
            self._deferredState = 2;
            self._deferred = [self._deferred, deferred];
            return;
        }

        self._deferred.push(deferred);
        return;
    }

    handleResolved(self, deferred);
}
```
对handle函数改造后便可实现链条存入数组操作了，接着就要考虑如何实现触发各条链条了，首先我们在触发操作中抽离一个函数，用以判断是否含有多条链条，在链条数量是否超过1两种情况，分别进行直接触发和遍历触发两种方式触发，这个方法我们称之为finale,另外resolve和reject也不会再直接操作handle触发链条,而是通过finale去调用
```js
function reject(self, newValue){
    self._state = 2;
    self._value = newValue;
    finale(self);
}

function resolve(self, newValue){
    self._state = 1;
    self._value = newValue;
    finale(self);
}

function finale(self) {
    if(self._deferredState === 1){
        handle(self, self._deferred);
        return;
    }
    if(self._deferredState === 2){
        for(var i =0; i<self._deferred.length; i++){
            handle(self, self._deferred[i]);
        }
        return;
    }
}
```
看！一个完整的finale函数已经被我们实现了，快拍拍手鼓励下你季几吧哈哈~

Case4:resolve(promise)
```js
var promise1 = new Promise(function(resolve, reject){
    setTimeout(function(){
        reject('from promise1')
    }, 1000)
});

var promise2 = new Promise(function(resolve, reject){
    setTimeout(function(){
        resolve(promise1);
    }, 3000)
});

promise2.then(function(val){
    console.log(val, 'to resolve');
}, function(val){
    console.log(val, 'to reject');
})
```

输出：from promise1 to reject
上面代码中,promise1和promise2都是 Promise 的实例，但是promise2的resolve方法将,promise1作为参数，即一个异步操作的结果是返回另一个异步操作。注意，这时,promise1的状态就会传递给promise2，也就是说，,promise1的状态决定了promise2的状态。如果,promise1的状态是pending，那么promise2的回调函数就会等待,promise1的状态改变；如果,promise1的状态已经是resolved或者rejected，那么promise2的回调函数将会立刻执行;

原理实际上非常简单，无论外部是执行resolve还是reject,在源码中都会用_state属性记录下来，那么我们在触发promise链条即deferred对象时，都参考参数中的promise作为指示即可。
```js
function getThen(obj){
    try{
        return obj.then;
    }catch(e){
        LAST_ERROR = e;
        return IS_ERROR;
    }
}

function resolve(self, newValue){
    if(self === newValue){
        reject(self, new TypeError('cannot resolve itself'))
    }

    if(newValue &&
        (typeof newValue === 'function' || typeof newValue === 'object')
    ){
        var then = getThen(newValue);
        if(then === IS_ERROR){
            reject(self, LAST_ERROR);
        }

        if(typeof then === self.then &&
            newValue instanceof Promise){
            self._state = 3;
            self.value = newValue;
            finale(self);
            return;
        }
    }
    self._state = 1;
    self._value = newValue;
    finale(self);
}
```
引入一个工具函数getThen,用以返回对象中的then属性。resolve开始的if代码块，用来在参数为promise本身时抛出错误。接着就开始判断newValue是否为Promise实例，newValue.then是否为promise原型上的then函数，如果判断通过，则将promise本身的state置为3（到此_state的三个值都出现过了一遍，猜猜是哪三个哈哈）。然后将self和_deferred对象交给finale函数处置啦~
```js
function handle(self, deferred) {
    while(self._state === 3){
        self = self._value;
    }

    if(self._state === 0){
        if(self._deferredState === 0){
            self._deferredState = 1;
            self._deferred = deferred;
            return;
        }
        if(self._deferredState === 1){
            self._deferredState = 2;
            self._deferred = [self._deferred, deferred];
            return;
        }

        self._deferred.push(deferred);
        return;
    }

    handleResolved(self, deferred);
}
```
finale函数并没有改变，真正改变的是finale调用的handle，它执行的关键一步就是self = self._value;self._value存放的是传入的参数promise1，这样之后的handleResolved触发的指示都依照promise1进行了。巧妙巧妙！

Case5:resolve(obj) typeof obj.then === 'function'

这个用法的场景至今没怎么遇到过，直到读源码的时候才开始重视了一下，接下来开始研究这个特性的用法和实现原理吧
```js
var obj = {
    then:function(resolve, reject){
        resolve('from obj');
    }
}

var promise1 = new Promise(function(resolve, reject){
    setTimeout(function(){
        resolve(obj);
    }, 1000)
});

promise1.then(function(val){
    console.log(val);
})
```

//输出：from obj
定义一个对象，对象中含有then属性为一个函数，resolve该对象时，执行效果相当于用obj.then内部的执行代码替换掉resolve(obj)这个语句。这样可以将promise中的可变部分抽离出来，放在obj.then中，then在不同情况下可以赋不同值，使得代码更具灵活性。首先执行的是promise.then函数，他为promise添加deferred对象；接着在1s之后会触发resolve，resolve监测到参数是一个带then函数的对象;我们在创建promise的时候都会传入一个fn，类似于var promise = new Promise(fn);之后这里出现的resolve的作用就是为promise重新绑定传入的fn,除此之外resolve不再有其他任何功能，这样就promise就会继续执行新传入的fn参数，这样的一个重新绑定参数的过程就实现了这个特性。于是resolve函数就变成了下面这个样子
```js
function resolve(self, newValue){
    if(self === newValue){
        reject(self, new TypeError('cannot resolve itself'))
    }

    if(newValue &&
        (typeof newValue === 'function' || typeof newValue === 'object')
    ){
        var then = getThen(newValue);
        if(then === IS_ERROR){
            reject(self, LAST_ERROR);
        }

        if(typeof then === self.then &&
            newValue instanceof Promise){
            self._state = 3;
            self._value = newValue;
            finale(self);
            return;
        }
        //resolve(obj) typeof obj.then === 'function'
        else if(typeof then === 'function'){
            doResolved(self, then.bind(newValue))
            return;
        }
        //resolve(obj) typeof obj.then === 'function'
    }
    self._state = 1;
    self._value = newValue;
    finale(self);
}
```
Case6:promise['resolve'].catch(fn1).then(fn2)， promise['reject'].catch(fn1).then(fn2)， promise['resolve'].then(fn1).catch(fn2)

这一个case里面包含了三个case,之所以放在一起，是因为这几个case在源码中是在一个函数的几个if分支中实现的，首先看下这几个case的执行结果

case:promise['resolve'].catch(fn1).then(fn2)
```js
var promise1 = new Promise(function(resolve, reject){
    setTimeout(function(){
        resolve('hello promise');
    }, 1000)
});

promise1.then(null, function(val){
    console.log(val + ' to catch');
}).then(function(val){
    console.log(val + ' to then')
});
```

//输出：hello promise to then
case:promise['reject'].catch(fn1).then(fn2)
```js
var promise1 = new Promise(function(resolve, reject){
    setTimeout(function(){
        reject('hello promise');
    }, 1000)
});

promise1.then(null, function(val){
    console.log(val + ' to catch');
    return val;
}).then(function(val){
    console.log(val + ' to then')
});
```

//输出：hello promise to catch
        hello promise to then
case:promise['resolve'].then(fn1).catch(fn2)
```js
var promise1 = new Promise(function(resolve, reject){
    setTimeout(function(){
        resolve('hello promise');
    }, 1000)
});

promise1.then(function(val){
    console.log(val + ' to then');
    return val;
}).then(null, function(val){
    console.log(val + ' to catch')
});
```

//输出：hello promise to catch
源码：
```js
function handleResolved(self, deferred) {
    asap(function(){
        var cb = self._state === 1 ? deferred.onFulfilled : deferred.onRejected;
        if(cb === null){
            if(self._state === 1){
                resolve(deferred.promise, self._value);
            }else {
                reject(deferred.promise, self._value);
            }
            return;
        }
        var ret = tryCallOne(cb, self._value);
        if(ret === IS_ERROR){
            reject(self, LAST_ERROR);
        }else{
            resolve(deferred.promise, ret);
        }
    })
}
```
源码不作分析，记住一个口诀，不报错误resolve进then不进catch，reject进then要在catch后。