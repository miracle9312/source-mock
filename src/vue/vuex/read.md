#vuex 源码
## install
- 避免重复安装
- 判断版本，不同版本用不同方式注入初始方法，2之前通过options.init注入，2之后通过mixin注入
- 将store注入到所有vue的实例属性$store中

## commit