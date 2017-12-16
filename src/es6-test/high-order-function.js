/**
 * Created by miracle on 2017/12/15.
 */
//===========================函数柯里化==========================================
function sayName(name){
    console.log(name);
}

//封装一个函数让其有更高级的操作
function wrapper(fn) {
    return function(){
        console.log('hello ');
        fn.apply(this, arguments)
    }
}

var sayHelloName = wrapper(sayName);

sayHelloName('miracle');

//============================thunkify 函数多参变单参=================================
function thunkify(fn) {
    return function() {
        //参数转为数组形式
        var args = Array.prototype.slice.call(this)
        return function(cb){
            args.push(cb);
            fn.apply(this, args);
        }
    }
}

var paramFn = function(val, callback){
    val *= val;
    callback.call(this, val);
};

var cbFn = function(val) {
    console.log(val)
};

var thunked = thunkify(paramFn);

thunked(50)(cbFn);