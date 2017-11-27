/**
 * Created by shaoxuezheng on 17/10/23.
 */
(function(){
    "use strict";

    var asap = require('asap/raw');
    //声明一个空函数，用于初始化一个没有执行逻辑的promise
    var noop = function(){};
    var IS_ERROR = {};
    var LAST_ERROR = null;

    Promise._noop = noop;

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

    //得到对象中的then函数，在resolve(Promise obj),resolve(object obj) case中使用
    function getThen(obj) {
        try{
            return obj.then;
        }catch(ex){
            LAST_ERROR = ex;
            return IS_ERROR;
        }
    }

    //声明Promise类
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

    Promise.prototype.then = function(onFulfilled, onRejected){
        var res = new Promise(noop);
        handle(this, new Handler(onFulfilled, onRejected, res));
        return res;
    };

    function finale(self) {
        if(self._deferredState === 1){
            handle(self, self._deferred);
            self._deferred = null;
        }
        if(self._deferredState === 2){
            for(var i = 0; i < self._deferred.length; i++ ){
                handle(self, self._deferred[i]);
            }
        }
    }

    //将原始的promise对象构造为一个包含子promise的链式promise
    function handle(self, deferred) {
        while (self._state === 3){
            self = self._value;
        }
        if(self._state === 0){
            if(self._deferredState === 0){//thepromise.then(fn)
                self._deferredState = 1;
                self._deferred = deferred;
                return;
            }
            if(self._deferredState === 1){//thepromise.then(fn1) thepromise.then(fn2)
                self._deferredState = 2;
                self._deferred = [self._deferred, deferred]
                return;
            }
            self._deferred.push(deferred);//thepromise.then(fn1) thepromise.then(fn2) thepromise.then(fn3)
            return;
        }

        handleResolved(self, deferred);
    }

    function handleResolved(self, _deferred) {
        //ASAP本轮事件循环结束时触发，区别于setTimeout
        asap(function(){//asap嵌套在递归中，会先执行本轮递归后面的代码，再执行下一轮递归
            var cb = self._state ===1 ? _deferred.onFulfilled :_deferred.onRejected;
            if(cb == null){
                if(self._state == 1){//case:promise['resolve'].catch(fn).then(fn)
                    resolve(_deferred.promise, self._value);
                }else{//case:promise['reject'].then(fn).then(fn).catch(fn)
                    reject(_deferred.promise, self._value);
                }
                return;
            }
            var ret = tryCallOne(cb, self._value);
            if(ret == IS_ERROR){//case:throw Error
                reject(_deferred.promise, LAST_ERROR)
            }else{//case:1、promise['resolve'].then().then() 2、promise['reject'].then
                resolve(_deferred.promise, ret);
            }

            self._deferred = null;
        })
    }

    //deferred对象原型
    function Handler(onFulfilled, onRejected, promise) {
        this.onFulfilled = typeof onFulfilled === 'function'? onFulfilled: null;
        this.onRejected = typeof onRejected === 'function'? onRejected: null;
        this.promise = promise;
    }

    function resolve(self, newValue) {
        if(self === newValue){//case:resolve(self, self)当resolve的参数是promise自身时抛出错误
            reject(self, new TypeError('a promise cannot resolve itself'))
        }

        if(newValue &&
            (typeof newValue === 'object' || typeof  newValue === 'function')){
            var then = getThen(newValue);
            if(then == IS_ERROR){
                reject(self, LAST_ERROR);
            }
            if(then === self.then && newValue instanceof Promise){//case:resolve(self, Promise obj)
                self._state = 3;
                self._value = newValue;
                finale(self);
                return;
            }else if(typeof then == 'function'){//case:resolve(obj['then'])
                doResolved(then.bind(newValue), self);
                return;
            }
        }

        self._state = 1;//onFulFilled
        self._value = newValue;
        finale(self);
    }

    function reject(self, newValue) {
        self._state = 2;//onRejected
        self._value = newValue;
        finale(self, self._deferred);
    }

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
        if(!done && ret === IS_ERROR){
            done = true;
            reject(self, LAST_ERROR);
        }
    }

    module.exports = Promise;
})();

