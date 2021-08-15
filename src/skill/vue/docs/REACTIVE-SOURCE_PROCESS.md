## 响应式原理


### 理解

响应式的本质是数据的更改能够实时反映到dom上，此外还能基于响应式的底层去实现computed以及watch的能力，实现数据跟数据之间的响应式；基于这样的原理可以拆接触几个实现的部分
数据监听： 对所有响应时数据去做监听
监听器： 监听的实际执行函数，在vue中有组件更新，watch函数，computed三类
依赖管理队列：所有的更新回调和数据之间需要建立联系，统一管理，统一暴露触发，注册回调以及重复依赖过滤等等

### 监听器watcher

``` js
export default class Watcher {

  constructor (
    vm: Component,
    expOrFn: string | Function,
    cb: Function,
    options?: Object
  ) {
    this.expression = process.env.NODE_ENV !== 'production'
      ? expOrFn.toString()
      : ''
    // parse expression for getter
    if (typeof expOrFn === 'function') {
      this.getter = expOrFn
    } else {
      this.getter = parsePath(expOrFn)
      if (!this.getter) {
        this.getter = function () {}
        process.env.NODE_ENV !== 'production' && warn(
          `Failed watching path: "${expOrFn}" ` +
          'Watcher only accepts simple dot-delimited paths. ' +
          'For full control, use a function instead.',
          vm
        )
      }
    }
    this.value = this.lazy
      ? undefined
      : this.get()
  }
  get () {
    pushTarget(this)
    let value
    const vm = this.vm
    try {
      // TODO 会执行？
      value = this.getter.call(vm, vm)
    } catch (e) {
    } finally {
      // "touch" every property so they are all tracked as
      // dependencies for deep watching
      if (this.deep) {
        traverse(value)
      }
      popTarget()
      this.cleanupDeps()
    }
    return value
  }

  /**
   * Add a dependency to this directive.
   */
  addDep (dep: Dep) {
    const id = dep.id
    if (!this.newDepIds.has(id)) {
      this.newDepIds.add(id)
      this.newDeps.push(dep)
      if (!this.depIds.has(id)) {
        dep.addSub(this)
      }
    }
  }

  /**
   * Subscriber interface.
   * Will be called when a dependency changes.
   */
  update () {
    /* istanbul ignore else */
    if (this.lazy) {
      this.dirty = true
    } else if (this.sync) {
      this.run()
    } else {
      queueWatcher(this)
    }
  }

  /**
   * Scheduler job interface.
   * Will be called by the scheduler.
   */
  run () {
    if (this.active) {
      const value = this.get()
      if (
        value !== this.value ||
        // Deep watchers and watchers on Object/Arrays should fire even
        // when the value is the same, because the value may
        // have mutated.
        isObject(value) ||
        this.deep
      ) {
        // set new value
        const oldValue = this.value
        this.value = value
        if (this.user) {
          try {
            this.cb.call(this.vm, value, oldValue)
          } catch (e) {
            handleError(e, this.vm, `callback for watcher "${this.expression}"`)
          }
        } else {
          this.cb.call(this.vm, value, oldValue)
        }
      }
    }
  }
  /**
   * Depend on all deps collected by this watcher.
   */
  depend () {
    let i = this.deps.length
    while (i--) {
      this.deps[i].depend()
    }
  }
}
```
对于理解watcher实现，核心需要理解的几个方法和实例化入参
* 属性
    1. vm：组件实例
    2. expOrFn: 实际的回调方法
    
* 方法
    1. update触发回调更新
    2. addDep依赖收集
    
以上这些属性和方法基本上可以满足watcher在响应式中的任务  

### 依赖管理队列Dep
 

```
export default class Dep {
  static target: ?Watcher;
  id: number;
  subs: Array<Watcher>;

  constructor () {
    this.id = uid++
    this.subs = []
  }

  addSub (sub: Watcher) {
    this.subs.push(sub)
  }

  removeSub (sub: Watcher) {
    remove(this.subs, sub)
  }

  depend () {
    if (Dep.target) {
      Dep.target.addDep(this)
    }
  }

  notify () {
    // stabilize the subscriber list first
    const subs = this.subs.slice()
    for (let i = 0, l = subs.length; i < l; i++) {
      subs[i].update()
    }
  }
}

Dep.target = null
const targetStack = []

export function pushTarget (_target: Watcher) {
  if (Dep.target) targetStack.push(Dep.target)
  Dep.target = _target
}

export function popTarget () {
  Dep.target = targetStack.pop()
}
``` 

Dep有两块核心的内容，Dep.target指向当前正在使用的watcher，当我们new Watcher()时会进行这个指向的绑定，后续dep.depend的对象都是当前的watcher，Dep类中有三个核心的内容，实例属性subs-依赖管理队列，实例方法depend-事件订阅器，实例方法notify-事件触发器

### 数据监听

数据监听的整个过程可以拆分成两个缓解，数据遍历-添加监听行为

#### 数据遍历
以props和data为例，在vue初始化时看下调用的路径

props
1.proxy:将vm._props.xxx的访问指向vm.xxx
2.loop props[key]->defineReactive

data
1.proxy(vm, `_data`, key): 将vm.data.xxx的访问指向vm.xxx
2.observe->walk->defineReactive

综上，props和data大概实现了一致的初始化路径，遍历属性调用defineReactive，以及代理改变属性访问路径

#### defineReactive

```
Object.defineProperty(obj, key, {
    enumerable: true,
    configurable: true,
    get: function reactiveGetter () {
      const value = getter ? getter.call(obj) : val
      if (Dep.target) {
        dep.depend()
        if (childOb) {
          childOb.dep.depend()
          if (Array.isArray(value)) {
            dependArray(value)
          }
        }
      }
      return value
    },
    set: function reactiveSetter (newVal) {
      const value = getter ? getter.call(obj) : val
      /* eslint-disable no-self-compare */
      if (newVal === value || (newVal !== newVal && value !== value)) {
        return
      }
      /* eslint-enable no-self-compare */
      if (process.env.NODE_ENV !== 'production' && customSetter) {
        customSetter()
      }
      if (setter) {
        setter.call(obj, newVal)
      } else {
        val = newVal
      }
      childOb = !shallow && observe(newVal)
      dep.notify()
    }
  })
```
defineReactive的核心就是通过defineProperty,在访问属性时通过dep.depend()收集依赖，对属性进行写操作时进行dep.notify()触发依赖回调

#### 流程图

<img style="margin: auto;display: block;" src="//pt-starimg.didistatic.com/static/starimg/img/fxB77HEL0G1629024172696.png" width="500px" height="250px"/> 

整体流程如上图，对于computed和watch的watcher跟组件更新的watcher在实现也不太一样
* computed: watcher的实例化参数是对应的computed里面的函数，在进行回调触发时会返回计算后的值
* watch api: 这个回调在执行时会直接触发watch中定义的方法

* 组件更新:组件更新的回调就是vue的updateComponent方法

#### 关于数组的更新

对于数组vue通过defineProperty劫持了
```
[
  'push',
  'pop',
  'shift',
  'unshift',
  'splice',
  'sort',
  'reverse'
]
```
以上几个方法，在执行之后会触发dep.notify执行依赖的回调

#### 关于组件更新的diff总结
* 节点是否相同的判断：key,tag,iscommen,data
* 判断节点不同，直接替换
* 判断节点相同
 1. 有子组件:基于key进行子组件的替换和更新（按新node的顺序进行）
 2. 没有子组件：更新属性



### proxy
将this.xxx的访问分别指向this._data.xxx,this._propsData.xxx
#### 实现
```
const sharedPropertyDefinition = {
  enumerable: true,
  configurable: true,
  get: noop,
  set: noop
}

export function proxy (target: Object, sourceKey: string, key: string) {
  sharedPropertyDefinition.get = function proxyGetter () {
    return this[sourceKey][key]
  }
  sharedPropertyDefinition.set = function proxySetter (val) {
    this[sourceKey][key] = val
  }
  Object.defineProperty(target, key, sharedPropertyDefinition)
}
```
