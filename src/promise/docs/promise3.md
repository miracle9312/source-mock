一
、Promise.resolve

实际开发过程中，我们可能经常会用到promise去干两件事

改变函数执行顺序，让函数的执行时间在等待执行任务队列的队尾，但又必须在setTimeout之前
把thenable对象转换成promise实例
```js
var p1 = new Promise(function(resolve, reject){
    resolve('some values')
})
p1.then(function(val){
    console.log('operate' + val);
    return val;
});

var obj = {then:function(resolve, reject){
   resolve('hello world') 
}};

var p2 = new Promise(function(resolve, reject){
       resolve(obj)
});

p2.then(function(val){
    console.log('operate' + val);
    return val;
});
```
以上的两个过程会被大量使用，但是每次使用的时候需要实例化一次promise，如果可以提供一个类方法能够自动帮忙实例化那样就可以节省很多代码，并且也可以增强代码的可读性；于是就引入了Promise.resolve方法，我们可以用Promise.resolve()对上面的代码进行重构
```js
var p1 = Promise.resolve('some values');
p1.then(function(val){
    console.log('operate' + val);
    return val;
});

var obj = {then:function(resolve, reject){
    resolve()
}};
var p2 = Promise.resolve(obj);
p2.then(function(val){
    console.log('operate' + val);
    return val;
});
```
这样以来，代码精简了很多，可读性也变强了，下面看看这个Promise.resolve方法的实现过程
```js
function valuePromise (val){
    var p = new Promise(Promise._noop);
    p._state = 1;
    p._value = val;
    return p;
}
```
上面的valuePromise函数是实例化一个promise之后，将promise的状态置为_onResolved状态的过程，同时返回这个promise；
```js
var NULL = valuePromise(null);
var UNDEFINED = valuePromise(undefined);
var FALSE = valuePromise(false);
var TRUE = valuePromise(true);
var EMPTYSTRING = valuePromise('');
var ZERO = valuePromise(0);
```
先定义一些比较常见的参数为基本数据类型值的promise，当参数为其中一个时可以直接返回结果，不用实例化，提升效率。
```js
Promise.resolve = function(val){
    if(val instanceof Promise){return val}

    if(val === null){return NULL}
    if(val === undefined){return UNDEFINED}
    if(val === true){return TRUE}
    if(val === false){return FALSE}
    if(val === 0){return ZERO}
    if(val === ''){return EMPTYSTRING}

    if(typeof val === 'object' || typeof val === 'function'){
        try{
            var then = val.then;
            if(typeof then === 'function'){
                return new Promise(then.bind(val));
            }
        }catch(ex){
            return new Promise(function(resolve, reject){
                reject(ex);
            })
        }
    }

    return valuePromise(val);
};
```
这里处理逻辑是针对参数val的不同类型来的

val为常见基本数据类型值时直接返回
val是一个thenable对象时先将thenable对象转换为promise类型
val是一个promise实例，则直接返回
其他情况，则通过valuePromise函数处理，返回一个_value属性为val参数的promise
实际上，读完这段源码，我考虑过其他的写法可能会更简单，就这个问题我还在github上提了一个 issuehttps://github.com/then/promise/issues/142
```js
Promise.resolve = function(value) { 
        return new Promise(function(resolve, reject){ resolve(value); })
 };
```
这段代码的作用跟源代码中的Promise.resolve是几乎一样的，但是作者为性能方面的考虑做了一些代码上的调整，如之前说的常用基本数据类型值的处理，以及参数为promise实例时的处理。

2、Promise.all

简单介绍下这个api的用法，参数是一个数组，数组中可以是promise实例，基本类型值，thenable对象；返回值是一个promise对象，它的状态会在数组中所有值变为onResolved时变为onResolved,返回的参数时各个promise 的返回值，当数组中其中一个值变为onRejected时变为onRejected；
```js
Promise.all = function(arr){
    var args = Array.prototype.slice.call(arr);
    var remaining = args.length;

    return new Promise(function(resolve, reject){
        if(args.length === 0){resolve([])};
        function res(i, val){
            if(typeof val === 'function' || typeof val === 'object'){
                if(val instanceof Promise){
                    while(val._state === 3){
                        val = val._value;
                    }
                    if(val._state === 1){resolve(val._value)}
                    if(val._state === 2){reject(val._value)}
                    val.then(function(val){
                        res(i, val);
                    });
                    return;
                }else{
                    var then = val.then;
                    if(typeof then === 'function'){
                        var p1 = new Promise(then.bind(val));
                        p1.then(function(val){
                            res(i, val);
                        })
                    }
                    return;
                }
            }

            args[i] = val;
            if(--remaining === 0){
                resolve(args);
            }
        }

        for(var i = 0; i < args.length; i++){
            res(i, args[i]);
        }
    })
}
```
这段逻辑的重点在于res函数，res函数的作用是，当参数是一个promise实例或者thenable对象时，它会在这个参数后面加一个then方法，挂载一个Handler对象，用于监听参数的状态，当执行到这个Handler对象时，又会触发这个res函数，此时传给res函数的应该是一个基本类型值;当res函数参数是一个基本类型值时，它会将这个基本类型值添加都返回数组中；当返回数组填满时，返回的promise状态就变成了resolved。当只要传入的参数数组中有一个状态变为onRejeced，promise就会reject。

3、Promise.race

很多时候我们可能要处理多个异步操作，把这些异步操作包装在promise或者thenable对象中，我们想要得到最先改变状态的异步操作的结果，将其状态作为我们的最终状态，其返回结果作为我们进行下步操作的参数值。
```js
var p1 = new Promise(function(resolve, reject){
    setTimeout(function(){
        resolve('hello p1')
    },1000)
});

var p2 = new Promise(function(resolve, reject){
    setTimeout(function(){
        resolve('hello p2')
    },2000)
});

var p =Promise.race([p1, p2]);
p.then(function(val){
    console.log(val);
});
```
//输出：hello p1
这段代码最终输出先触发resolve的promise的返回值，并且 p的状态也会同步成p1的onResolved。以下是Promise.race的实现原理
```js
Promise.race = function(values) {
    return new Promise(function(resolve, reject){
        values.forEach(function(val){
            Promise.resolve(val).then(resolve, reject);
        })
    })
};
```
以上的处理过程可以分为这么几步

遍历参数数组，将其通过Promise.resolve转化为一个promise实例
为每个 promise实例挂载一个Handler对象，这个handler对象的_onFulfilled和onRejected函数分别为 外部Promise的resolve,reject函数
只要参数数组中的promise实例的一个改变状态，便会触发外部promise同步状态，添加结果为参数值
4、Promise.reject

这个api的作用实际上跟Promise.resolve的设计出发点是一样的，省去实例化过程，简化开发者的代码让代码更具可读性。它会返回一个状态为onRejected，值为传入参数的promise对象，并直接触发Handler对象中的onRejected函数
```js
var p1 = Promise.reject('hello p1');
p1.then(function(val){
    console.log(val)
})
//输出： hello p1
```
实现原理如下
```js
Promise.reject = function(value) {
    return new Promise(function(resolve, reject){
        reject(value);
    })
};
```
这个过程实例化一个promise，状态立即变为onRejected,promise._value的值变为传入的value，然后再返回这个promise。

5、Promise.prototype.catch

在对象方法catch出来之前，我们会用promise.then(null, fn)来处理promise在onRejected时的操作，但是这个null的存在非常多余，对我们的代码逻辑没有任何影响，但是我们的目标就是拒绝一切冗余代码，对象方法catch应运而生，下面用一串代码解释一下这个等价效果
```js
var p1 = Promise.reject('hello');

p1.then(null, function(val){
    console.log(val)
});

//等价于

var p1 = Promise.reject('hello');

p1.catch(function(val){
    console.log(val)
});
```
其实到这里我们再略微琢磨，就能把源码写出来了，catch的作用相当于为promise实例执行了一次then.(null, fn),catchd等价于then(null, fn)
```js
Promise.prototype['catch'] = function(onRejected){
    return this.then(null, onRejected);
};
```
随手一写就撸出来一段源码是不是很有成就感

6、Promise.prototype.done

在promise中，promise.then(fn1).catch(fn2).catch(fn3)这样一个promise链，fn1中的错误能被fn2捕捉并处理，fn2中的报错能被fn3捕捉处理，但fn3的错误没办法处理。这就是promise中存在的一个问题，promise链的最后一环出现错误时总是不能被处理。这个也就是对象方法done的应用场景。那怎么设计这个done呢？如果我想promise链的末端的错误都能被处理，那么我在这个末端挂载的的时候自动在末端的后面挂载一个then(null,fn),并且这里的fn就是一个报错函数，并且这个函数本身没有任何问题 ，那么我们的问题是不是可以解决掉了。这里，我们的末端都用一个统一的done来挂载，也就是说done总是在链的尾部。实际上这应该就是done的设计思想。总结以上的思考过程这个done执行了两个过程，一个是挂载链末端，一个是在末端再挂载一个错误处理的末末端。
```js
Promise.prototype['done'] = function(onFulFilled, onRejected){
    var self = arguments.length ? this.then.apply(this, arguments) : this;
    self.then(null, function(err){
        setTimeout(function(){
            throw err
        },0)
    })
};
```
可以看到如果done内的参数onFulFilled,onRejected不为空时，执行了两次Handler对象的挂载过程，一次末端一次是末末端。最后的抛出错误用了一个异步setTimeout，是为了避开源码中的try-catch把这个错误吞掉，在后面的错误处理机制章节会有相关介绍，读了之后你就会明白。