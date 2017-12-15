/**
 * Created by miracle on 2017/12/15.
 */
//斐波那契数列
function fibo(n) {
    if(n==1||n==2){
        return 1;
    }else{
        return fibo(n-1) + fibo(n-2);
    }
}

console.log(fibo(20));

//递归数列
function factorial(n){
    if(n == 1){
        return 1;
    }else{
        return n* factorial(n-1);
    }
}

console.log(factorial(3));

//深度遍历一个对象
//遍历一个二叉树