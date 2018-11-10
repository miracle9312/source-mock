/**
 * Created by didi on 17/12/7.
 */
'use strict';

let obj = {
    name: 'miracle'
};
let p1 = new Proxy(obj, {
    get:function(target, property){
        return target[property]+' proxy';
    }
});

p1.sex = 'male';

console.log(p1);

//proxy实现链式写法
var funcs = {
    sqrt: n=>n*n,
    double: n=>2*n,
    add: n=>n+2
}

var pipe = function(value) {
    var evtStack = [];
    var p = new Proxy({},{
        get: function(target, property) {
            if(property === 'get'){
                return evtStack.reduce(function(val, fn){
                    return fn(val)
                }, value);
            }

            evtStack.push(funcs[property]);
            return p;
        }
    });

    return p;
};

console.log(pipe(3).sqrt.double.add.get);


//多态
function Obama(){}
Obama.prototype.sayHello = function(){
  console.log('hello');
}

function Xijinping(){};
Xijinping.prototype.sayHello = function(){
  console.log('你好');
}

function sayHi(leader){
  leader.sayHello();
}

sayHi(new Obama(),'多态');
sayHi(new Xijinping(), '多态');