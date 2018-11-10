一、promise中的诡异现象
```js
var p1 = new Promise(function(resolve, reject){
    x+1;
});

var p2 = new Promise(function(resolve, reject){
    resolve();
}).then(function(){
    x+1
});

var p3 = new Promise(function(resolve, reject){
    setTimeout(function(){
        x+1;
    },0)
});

var p4 = new Promise(function(resolve, reject) {
    x+1
}).then(null, function(err){
    console.log(err, 'test');
});
```
以上是四个promise实例，四个实例中x都有引用错误的问题，但是执行的时候，只有p3,p4捕获了错误并抛出，p1,p2执行时没有任何提示，这就是很多人所谓的错误被promise吞掉了，那这个错误到底去哪了呢。

在promise实现中，对于函数参数，在执行时都会通过try-catch进行异常处理；如果执行出错时，这个错误会通过reject扔出，但是reject能扔出错误的前提是promise通过then(null,function)或者是catch(function)挂载了Handler对象，将错误信息作为参数通过Handler对象的_onRejected函数也就是上面的两个function进行错误信息处理。但是promise没有挂载Handler对象的话，这个错误已经被 try-catch捕获，不会在控制台打印错误信息，所以不会有任何反应。但是在setTimeout中出现的错误，由于异步的关系不会被try-catch捕获到，所以还是能够看到错误信心被控制台打印出来了。以下是源码中的处理

try-catch过程
```js
//将a作为fn的参数进行执行
function tryCallOne(fn, a) {
    try{
        return fn(a);
    }catch(ex){
        LAST_ERROR = ex;
        return IS_ERROR;
    }
}

//将a, b作为fn的参数执行
function tryCallTwo(fn, a, b) {
    try{
        return fn(a, b);
    }catch(ex){
        LAST_ERROR = ex;
        return IS_ERROR;
    }
}
```
then中的函数参数都会在tryCallOne函数中被当作fn参数进行处理，promise实例化时传入的函数参数都会在tryCallTwo函数中被当做参数fn进行处理。

错误处理过程
```js
function doResolved(self, fn) {
    var done = false;
    //此处是tryCallTwo的执行，并把执行结果保存到变量ret中
    var ret = tryCallTwo(fn, function(val){
        if(done){return;}
        done = true;
        resolve(self, val);
    },function(val){
        if(done){return;}
        done = true;
        reject(self, val);
    });
    if(!done && ret === IS_ERROR){//如果返回之ret包含错误信息则交由reject函数处理
        done = true;
        reject(self, LAST_ERROR);
    }
}

function handleResolved(self, _deferred) {
    asap(function(){
        var cb = self._state ===1 ? _deferred.onFulfilled :_deferred.onRejected;
        if(cb == null){
            if(self._state == 1){
                resolve(_deferred.promise, self._value);
            }else{
                reject(_deferred.promise, self._value);
            }
            return;
        }
        //此处是tryCallTwo的执行，并把执行结果保存到变量ret中
        var ret = tryCallOne(cb, self._value);
        if(ret == IS_ERROR){ //如果返回之ret包含错误信息则交由reject函数处理
            reject(_deferred.promise, LAST_ERROR)
        }else{
            resolve(_deferred.promise, ret);
        }

        self._deferred = null;
    })
}
```
从上面代码可以看到，所有的执行的错误都会进入到reject函数，但是想通过reject抛出的前提是promise必须挂载了对错误处理的Handler对象，如果没有，那错误就会拦截掉。然后问题就来了，如果我想让错误不被拦截，我该怎么用promise，promise又是怎么针对这个问题进行设计的呢？

二、我们要的错误处理应该长啥样？

实际上我们要讨论的下需求了，我们到底要一个怎么的promise,promise该怎么把我们的错误吐出来还给我们。我们要的其实很简单，总结下就是这么几点

我们希望promise在侦测到自己没有挂载Handler对象时能够自动把错误信息打印出来
对了我还希望它能知道我想要它把哪种类型的错误信息打印出来，RangeError,TypeError 或者其他类型的错误
可能有时候我会希望拿到错误结果自己处理
哎，对了我还希望我在异步挂载Handler时，能够把这个打印操作取消
嗯，就这些了。 好！你要的promise都能满足你我的小公举！

三、rejections-tracking代码解析

上面的需求，我们可以用两个函数就能解决，一个函数用在报错的时候，另一个用在解除报错时；定义两个类方法Promise.onReject,Promise.onHandle。

由于我们的操作是在reject操作之前发生的，所以我们在reject方法的开头使用这个Promise.onReject，Promise.onReject方法的主要功能可以分为三个步骤，判断promise是否已经挂载了Handler对象->打印错误->将错误放入错误队列。
```js
function enable(options) {
    options = options || {};
    if(enabled){disable()}
    enabled = true;
    var displayId = 0,
        rejections = {},
        id = 0;

    Promise._onReject = function(promise, err){
        if(promise._deferredState === 0){
            promise._rejectionId = id++;
            rejections[promise._rejectionId] = {//定义一个错误队列
                displayId : null,
                error: err,
                timeout: setTimeout(
                    onUnHandled.bind(null, promise._rejectionId),
                    matchWhitelist(err, DEFAULT_WHITELIST)?100 : 2000),
                logged:false
            }
        }
    };

    function onUnHandled(id) {
        if(options.allRejections ||
            matchWhitelist(
                rejections[id].error,
                options.whitelist || DEFAULT_WHITELIST)){
            rejections[id].displayId = displayId ++;
            rejections[id].logged = true;
            if(options.onUnHandled){
                options.onUnHandled(
                    rejections[id].displayId,
                    rejections[id].error
                )
            }else{
                logError(
                    rejections[id].displayId,
                    rejections[id].error
                )
            }
        }
    }
}

function matchWhitelist(err, list) {
    return list.some(function(cls){
        return err instanceof cls;
    })
}

function logError(id, err){
    console.warn('Possible Unhandled Promise Rejection (id: ' + id + '):');
    var errStr = err && (err.stack || err)+ '';
    errStr.split('\n').forEach(function(line){
        console.warn('   ' + line);
    })
}
```
由于之后要考虑要有解除报错的操作，所以我们需要一个错误队列来保存错误，这个错误队列我们利用闭包把它包装成一个私有变量，这样可以控制外部访问，也能使它跟全局变量具有相同的生命周期，这个错误队列就是rejections了；displayId是已报错的错误的索引，id是所有错误信息的索引；options参数是一个对象，里面有四个属性，allrejetions属性对应的值是布尔类型，用于指示是否对所有错误信息都执行这个报错过程，whitelist属性对应的值是数组类型，用于存放要处理的错误类型；onHandled属性对应的值是函数类型，用于自定义报错处理操作；onUnHandled属性对应的值是函数类型，用于自定义取消报错处理；通过阅读整个逻辑可以知道，报错只在未挂在Handler对象的时候触发，当options传入onUnHandled时会通过unUnHandled进行错误处理，如果onUnHandled属性为空时则通过logError函数将错误打印在控制台；matchWhitelist方法的作用时判断错误的类型。整个处理过程简单清晰。

以上是报错的全部逻辑，接下来介绍解除报错的处理，解除报错发生的时间是在挂载Handler对象之前，所以我们把解除报错的方法写在handle方法的开头，并且是在已触发报错，这个错误存在错误队列中的情况下，解除的类型分为两种：

第一种，我们看到触发报错的方法是写在一个setTimeout方法中，加入错误没有被打印在控制台，我们可以通过clearTimeout取消这个操作；

第二种；错误可能在我们挂载Handler对象之前就已经被打印在控制台了，此时我们已经无法取消操作，我们要做的就是在控制台上告诉开发者这个错误已经被取消

然后我们吧这个错误从错误列表中删除。
```js
Promise._onHandle = function(promise){
        if(
            promise._state === 2 &&
            rejections[promise._rejectionId]
        ){
            if(rejections[promise._rejectionId].logged){
                onHandled(promise._rejectionId);
            }else{
                clearTimeout(rejections[promise._rejectionId].timeout);
            }

            delete rejections[promise._rejectionId];
        }
    };

    function onHandled(id){
        if(rejections[id].logged){
            if(options.onHandled){
                options.onHandled(
                    rejections[id].displayId,
                    rejections[id].error
                )
            }else{
                console.warn(
                    'Promise Rejection Handled (id: ' + rejections[id].displayId + '):'
                );
                console.warn(
                    '  This means you can ignore any previous messages of the form "Possible Unhandled Promise Rejection" with id ' +
                    rejections[id].displayId + '.'
                );
            }
        }
    }
```
开发者有时可能并不需要这样一个控制报错机制，所以我们给这个报错机制加了一个开关disable(),enable(),开启过程上面已经介绍过了，关闭过程就是把主要处理报错的方法置空，并设置状态，代码如下
```js
//指示是否开启报错机制
var enabled = false;

function disable() {
    enabled = false;
    Promise._onReject = null;
    Promise._onHandle = null;
}
```
以上就是promise针对吞掉报错信息的一些处理，源码放在rejections-tracking.js中，这部分内容对于promise的主要功能相比可能显得比较次要，但是在以后的开发中，我们在开发一些基础控件或者是通用方法库的时候，引入一些错误处理机制会使得这些组件在被使用时更加友好更加专业，在这我也学到了很多，对于以后开发更底层一些的组件也更多了一点信心。