/*eslint-disable*/
@child("boy")
@ancestor
class MyCls {
    constructor () {}

    @marry("kw")
    name(){
        return 'miracle married'
    }
}

function child(sex) {
    return function (target) {
        target.prototype.child = sex;
    }
}

function ancestor(target) {
    target.gene = "miracle&kw";
}

function marry(wife) {
    return function(target, name, descriptor) {
        var oldVal = descriptor.value;
        descriptor.value = function() {
            return oldVal.apply(null, arguments) + " " + wife;
        }
        return descriptor;
    }
}

var obj = new MyCls();
console.log(obj.name()+" get birth to an " + obj.child + " success their " + MyCls.gene + " property")
