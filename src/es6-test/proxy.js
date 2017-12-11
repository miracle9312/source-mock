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
