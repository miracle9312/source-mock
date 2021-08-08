## 组件化

### 定义

所谓组件化，就是把页面拆分成多个组件 (component)，每个组件依赖的 CSS、JavaScript、模板、图片等资源放在一起开发和维护。组件是资源独立的，组件在系统内部可复用，组件和组件之间可以嵌套

### 本质

在createElement实际创建vnode时，将组件和普通标签进行区分，组件的vnode描述是一个继承于Vue基类，可以在vm实例上重新实例内部的update操作；所以在解析完vnode，实际对组件执行的patch是组件实例的update去挂载dom

### 实现

#### 构造子类构造函数

子类构造函数的实现是为了组件可以复用父类的属性和方法执行组件render
```js
Vue.extend = function (extendOptions: Object): Function {
  extendOptions = extendOptions || {}
  const Super = this
  const SuperId = Super.cid
  const cachedCtors = extendOptions._Ctor || (extendOptions._Ctor = {})
  if (cachedCtors[SuperId]) {
    return cachedCtors[SuperId]
  }

  const name = extendOptions.name || Super.options.name
  if (process.env.NODE_ENV !== 'production' && name) {
    validateComponentName(name)
  }

  const Sub = function VueComponent (options) {
    this._init(options)
  }
  Sub.prototype = Object.create(Super.prototype)
  Sub.prototype.constructor = Sub
  Sub.cid = cid++
  Sub.options = mergeOptions(
    Super.options,
    extendOptions
  )
  Sub['super'] = Super

  // For props and computed properties, we define the proxy getters on
  // the Vue instances at extension time, on the extended prototype. This
  // avoids Object.defineProperty calls for each instance created.
  if (Sub.options.props) {
    initProps(Sub)
  }
  if (Sub.options.computed) {
    initComputed(Sub)
  }

  // allow further extension/mixin/plugin usage
  Sub.extend = Super.extend
  Sub.mixin = Super.mixin
  Sub.use = Super.use

  // create asset registers, so extended classes
  // can have their private assets too.
  ASSET_TYPES.forEach(function (type) {
    Sub[type] = Super[type]
  })
  // enable recursive self-lookup
  if (name) {
    Sub.options.components[name] = Sub
  }

  // keep a reference to the super options at extension time.
  // later at instantiation we can check if Super's options have
  // been updated.
  Sub.superOptions = Super.options
  Sub.extendOptions = extendOptions
  Sub.sealedOptions = extend({}, Sub.options)

  // cache constructor
  cachedCtors[SuperId] = Sub
  return Sub
}
```
关键的两步
* 声明一个Sub类，从Vue的this实例中通过原型链继承获得基础类的方法和属性
* cache避免重复声明作缓存处理

#### 安装钩子函数

用于patch过程中，调用组件的具体的钩子函数（不太理解）

### patch

在整个patch过程中，会对标签和组件有不同的处理，对于组件的处理是，通过调用实例上的方法去执行render->createElement->update，实现组件的实际挂载，通过自上而下的render实现组件树的渲染
