/**
 * Created by miracle on 2017/11/23.
 */
(function(){
    'use strict'

    var Promise = require('./promise-mock2');

    module.exports = Promise;

    /*var constructPromise = function(value){
        return new Promise(function(resolve, reject){
            resolve(value);
        });
    };

    Promise.resolve = function(value){
        if(value !== null){
            if(typeof value === 'function' || typeof value === 'object'){
                if(value instanceof Promise){
                    return value;
                }

                if(value.then && typeof value.then === 'function'){
                    return new Promise(value.then);
                }
            }

            constructPromise(value);
        }

        constructPromise(null);
    }*/
})();