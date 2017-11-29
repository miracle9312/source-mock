/**
 * Created by miracle on 2017/11/23.
 */
'use strict'

var Promise = require('./promise-mock2');

module.exports = Promise;

var NULL = valuePromise(null);
var UNDEFINED = valuePromise(undefined);
var FALSE = valuePromise(false);
var TRUE = valuePromise(true);
var EMPTYSTRING = valuePromise('');
var ZERO = valuePromise(0);

//创建一个值为value，状态为resolved,没有任何操作逻辑的promise
function valuePromise (val){
    var p = new Promise(Promise._noop);
    p._state = 1;
    p._value = val;
    return p;
}

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
};

Promise.race = function(values) {
    return new Promise(function(resolve, reject){
        values.forEach(function(val){
            Promise.resolve(val).then(resolve, reject);
        })
    })
};

Promise.reject = function(value) {
    return new Promise(function(resolve, reject){
        reject(value);
    })
};

Promise.prototype['catch'] = function(onRejected){
    return this.then(null, onRejected);
};