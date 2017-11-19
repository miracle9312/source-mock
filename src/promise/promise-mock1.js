/**
 * Created by shaoxuezheng on 17/10/23.
 */
(function(){
    "use strict";
    var asap = require('asap/raw');

    //声明一个空函数，用于初始化一个没有执行逻辑的promise
    var noop = function(){};

    //将a作为fn的参数进行执行
    function tryCallOne(fn, a) {
        try{
            return fn(a);
        }catch(e){
            throw new Error(e);
        }
    }

    //将a, b作为fn的参数执行
    function tryCallTwo(fn, a, b) {
        try{
            return fn(a, b);
        }catch(e){
            throw new Error(e);
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

    //将原始的promise对象构造为一个包含子promise的链式promise
    function handle(self, deferred) {
        if(self._deferredState === 0){
            self._deferredState = 1;
            self._deferred = deferred;
            return;
        }
    }

    //deferred对象原型
    function Handler(onFulfilled, onRejected, promise) {
        this.onFulfilled = typeof onFulfilled === 'function'? onFulfilled: null;
        this.onRejected = typeof onRejected === 'function'? onRejected: null;
        this.promise = promise;
    }

    //分解promise并执行其中的deferred函数
    function resolve(self, newValue){
        asap(function(){
            self._state = 1;
            self._value = newValue;

            //该promise添加过deferred对象
            if(self._deferredState === 1){
                var cb = self._state ===1 ? self._deferred.onFulfilled :self._deferred.onRejected;
                var ret = tryCallOne(cb, self._value);
                resolve(self._deferred.promise, ret);
                self._deferred = null;
            }

            return;
        })
    }

    function doResolved(self, fn) {
        tryCallTwo(fn, function(val){
            resolve(self, val);
        },function(){
            //reject code
        });
    }

    function timeout() {
        var promiseObj = new Promise(function(resolve, reject){
            console.log('promise');
            resolve();
        });

        return promiseObj;
    }

    console.log('io');

    timeout().then(function(){
        console.log('to then');
    });

})();