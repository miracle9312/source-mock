/**
 * Created by miracle on 2017/11/28.
 */
var Promise = require('./promise-mock2');
module.exports = Promise;

Promise.prototype['done'] = function(onFulFilled, onRejected){
    var self = arguments.length ? this.then.apply(this, arguments) : this;
    self.then(null, function(err){
        //错误可以抛出到外部？？？
        setTimeout(function(){
            throw err
        },0)
    })
};