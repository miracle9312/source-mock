/**
 * Created by miracle on 2017/12/8.
 */
const fs = require('fs')
var obj = {
    name: 'miracle'
};
var p1 = new Proxy(obj, {
    defineProperty: function(target, key, des) {
        console.log(target[key], des);
        return true;
    }
});
/*p1.name = 'male'*/

Object.defineProperty(p1,'name',{
    configurable: true
});


var obj = {
    [Symbol.iterator]: function () {
        var val = 0;
        return {
            length: 10,
            next:function(){
                if(val < this.length){
                  return {value: val++, done:false}
                }else{
                    return {done: true}
                }
            }
        }
    }
};

console.log([...obj],'iterator');

function* genera(){
    console.log('start');
    console.log(`name:${yield}`);
    console.log(`property:${yield}`);
}

var obj = genera();
var a = obj.next();
var b = obj.next('miracle');
var c = obj.next('is handsome');
console.log(a,b,c);



//封装一个Generator让其第一次就能输出值
function* genera1() {
    console.log(`hello ${yield}`)
}

function wrapper1(fn) {
    return function() {
        let tempGenera = fn.apply(this, arguments);
        tempGenera.next();
        return tempGenera;
    }
}

var secGenera = wrapper1(genera1);
secGenera().next('miracle','=====wrapper=====');

function* genera2() {
    var x = yield 'miracle';
    console.log(x);
}

var genera2Obj = genera2();
var n1 = genera2Obj.next();
var n2 = genera2Obj.next('is handsome');
var n3 = genera2Obj.next('is greatful');
console.log(n1, n2, n3)

function* geneAsync() {
    console.log(1);
    yield setTimeout(function(){
        console.log(2)
    }, 1000);
    console.log(3)
}

var geneAsyncObj = geneAsync();
geneAsyncObj.next();
geneAsyncObj.next();

//
function runGenera(fn) {
    var g = fn();

    function next(err, data) {
        var result = g.next(data);
        if(result.done) return;
        result.value(next)
    }

    next();
}

