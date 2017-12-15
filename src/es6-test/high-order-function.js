/**
 * Created by miracle on 2017/12/15.
 */
//函数柯里化
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