/**
 * Created by miracle on 2017/12/8.
 */
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
