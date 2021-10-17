// // 父类
// function Parent() {
//   this.firstName = 'James'
// }
//
// // 子类
// function Children() {}
//
// Children.prototype = new Parent()
//
// let children = new Children()
// console.log(children.firstName)

// 父类
// function Parent(firstName) {
//   this.firstName = firstName
//   this.lastName = 'James'
// }
//
// // 子类
// function Children() {
//   Parent.call(this, 'Bronny')
//   this.age = 22
// }
//
// let children = new Children()
//
// console.log(children.firstName)//

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
