/**
 * Created by miracle on 2017/12/18.
 */
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