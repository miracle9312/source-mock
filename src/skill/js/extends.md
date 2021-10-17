## 继承

### 原型链继承
```js
// 父类
function Parent() {
  this.lastName = 'James'
}

// 子类
function Children() {}

Children.prototype = new Parent()

let children = new Children()
console.log(children.lastName)// James
```

通过将子类的原型指向父类的属性，从而达到继承父类所有属性的目的，存在以下问题
* js对象为引用类型，可能会造成原型链污染
* 父类的构造函数不能够传递参数

### 借用构造函数

```js
// 父类
function Parent(firstName) {
  this.firstName = firstName
  this.lastName = 'James'
}

// 子类
function Children(fistName) {
  Parent.call(this, fistName)
  this.age = 22
}

let children = new Children('Bronny')

console.log(children.firstName)// 
```

通过在子类构造函数中调用父类构造函数，实现属性继承，存在以下问题
* 不能够继承原型链上的属性

### 组合式继承

```js
// 父类
function Parent (firstName) {
  this.firstName = firstName
  this.lastName = 'James'
}

Parent.prototype.skill = function(){
  return 'I can play basketball'
}

function Children (fistName) {
  Parent.call(this, fistName)
}

Children.prototype = new Parent()

let children = new Children('Bronny')

console.log(children.skill())
```

通过利用原型链和借用构造函数的方式实现了继承，存在以下问题
* 子类的实现需要调用两次父类构造函数

