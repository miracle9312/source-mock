import ModuleCollection from "./modules/module-collection";
import applyMixin from "./mixin";
import { isObject, isPromise, forEachValue } from "./util";

let Vue = null;

export class Store {
  constructor (options = {}) {
    // 声明属性
    this._mutations = Object.create(null);// 为什么不直接赋值null
    this._actions = Object.create(null);
    this._modules = new ModuleCollection(options);
    this._wrappedGetters = Object.create(null);
    this._modulesNamespaceMap = Object.create(null);
    // 声明发布函数
    const store = this;
    const { commit, dispatch } = this;
    // ?? todo 为什么最终要定义为实例属性
    this.commit = function (_type, _payload, _options) {
      return commit.call(store, _type, _payload, _options);
    };
    this.dispatch = function (_type, _payload, _options) {
      return dispatch.call(store, _type, _payload, _options);
    };
    const state = this._modules.root.state;
    // 安装根模块
    this.installModule(this, state, [], this._modules.root);
    // 注册数据相应功能的实例
    this.resetStoreVm(this, state);
  }

  get state () {
    return this._vm._data.$$state;
  }

  set state (v) {
    if (process.env.NODE_ENV !== "production") {
      console.error("use store.replaceState()");
    }
  }

  installModule (store, state, path, module, hot) {
    const isRoot = !path.length;
    // 获取namespace
    const namespace = store._modules.getNamespace(path);
    // 注册namespacemap
    if (module.namespaced) {
      this._modulesNamespaceMap[namespace] = module;
    }
    // 构造嵌套state
    if (!isRoot && !hot) {
      const moduleName = path[path.length - 1];
      const parentState = getNestedState(state, path.slice(0, -1));
      Vue.set(parentState, moduleName, module.state);
    }
    // 注册mutation事件队列
    const local = module.context = makeLocalContext(store, namespace, path);

    module.forEachMutation((mutation, key) => {
      const namespacdType = namespace + key;
      this.registerMutation(store, namespacdType, mutation, local);
    });

    module.forEachAction((action, key) => {
      const type = action.root ? type : namespace + key;
      const handler = action.handler || action;
      this.registerAction(store, type, handler, local);
    });

    module.forEachGetters((getter, key) => {
      const namespacedType = namespace + key
      this.registerGetter(store, namespacedType, getter, local);
    });
    // 递归安装模块
    module.forEachChild((child, key) => {
      this.installModule(store, state, path.concat(key), child, hot);
    });
  }

  // 触发action事件队列
  dispatch (_type, _payload) {
    const {
      type,
      payload
    } = unifyObjectStyle(_type, _payload);

    // ??todo 为什么是一个事件队列，何时会出现一个key对应多个action
    const entry = this._actions[type];

    // 返回promise,dispatch().then()接收的值为数组或者某个值
    return entry.length > 1
      ? Promise.all(entry.map((handler) => handler(payload)))
      : entry[0](payload);
  }

  // 注册action，事件队列中的事件返回值都是promise
  registerAction (store, type, handler, local) {
    const entry = this._actions[type] || (this._actions[type] = []);
    entry.push(function WrappedActionHandler (payload, cb) {
      let res = handler.call(store, {
        dispatch: local.dispatch,
        commit: local.commit,
        state: local.state,
        getters: local.getters,
        rootGetters: store.getters,
        rootState: store.state
      }, payload, cb);
      // 默认action中返回promise，如果不是则将返回值包装在promise中
      if (!isPromise(res)) {
        res = Promise.resolve(res);
      }

      return res;
    });
  }

  // 注册mutation
  registerMutation (store, type, handler, local) {
    const entry = this._mutations[type] || (this._mutations[type] = []);
    entry.push(function WrappedMutationHandler (payload) {
      handler.call(store, local.state, payload);
    });
  }

  // 注册getter
  registerGetter (store, type, rawGetters, local) {
    // 处理getter重名
    if (this._wrappedGetters[type]) {
      console.error("duplicate getter");
    }
    // 设置_wrappedGetters，用于
    this._wrappedGetters[type] = function wrappedGetterHandlers (store) {
      return rawGetters(
        local.state,
        local.getters,
        store.state,
        store.getters
      );
    };
  }

  // 触发对应type的mutation
  commit (_type, _payload, _options) {
    // 获取参数
    const {
      type,
      payload
    } = unifyObjectStyle(_type, _payload, _options);
    const entry = this._mutations[type];
    // 遍历触发事件队列
    entry.forEach(function commitIterator (handler) {
      handler(payload);
    });
  }

  // 注册响应式实例
  resetStoreVm (store, state) {
    const oldVm = store._vm;
    const computed = {};
    const wrappedGetters = store._wrappedGetters;
    store.getters = {};
    // 将store.getters[key]指向store._vm[key],computed赋值
    forEachValue(wrappedGetters, function (fn, key) {
      Object.defineProperty(store.getters, key, {
        get: () => store._vm[key],
        enumerable: true
      });
      computed[key] = () => fn(store);
    });
    // 注册
    store._vm = new Vue({
      data: {
        $$state: state
      },
      computed
    });
    // 注销旧实例
    if (oldVm) {
      Vue.nextTick(() => {
        oldVm.destroy();
      });
    }
  }
}

// 入参规则：type可以是带type属性的对象，也可以是字符串
function unifyObjectStyle (type, payload, options) {
  if (isObject(type)) {
    payload = type;
    options = payload;
    type = type.type;
  }

  return { type, payload, options };
}

// 根据路径获取嵌套对象值，reduce的运用
function getNestedState (state, path) {
  return path.length
    ? path.reduce((state, key) => state[key], state)
    : state;
}

export function install (_Vue) {
  // 避免重复安装
  if (Vue && Vue === _Vue) {
    // 开发环境报错
    console.warn("duplicate install");
  }
  Vue = _Vue;
  // 开始注册全局mixin
  applyMixin(Vue);
}

// 惰性赋值，每次获取最新的module值 todo
function makeLocalContext (store, namespace, path) {
  const noNamespace = namespace === "";
  const local = {
    dispatch: noNamespace
      ? store.dispatch
      : (_type, _payload, _options) => {
        const args = unifyObjectStyle(_type, _payload, _options);
        let { type } = args;
        const { payload, options } = args;
        if (!options || !options.root) {
          type = namespace + type;
        }
        store.dispatch(type, payload, options);
      },
    commit: noNamespace
      ? store.commit
      : (_type, _payload, _options) => {
        const args = unifyObjectStyle(_type, _payload, _options);
        let { type } = args;
        const { payload, options } = args;
        if (!options || !options.root) {
          type = namespace + type;
        }
        store.commit(type, payload, options);
      }
  };

  Object.defineProperties(local, {
    state: {
      get: () => getNestedState(store.state, path)
    },
    getters: {
      get: noNamespace
        ? () => store.getters
        : () => makeLocalGetters(store, namespace)
    }
  });

  return local;
}

function makeLocalGetters (store, namespace) {
  const gettersProxy = {};
  const splitPos = namespace.length;
  Object.keys(store.getters)
    .forEach((type) => {
      // 匹配namespace
      if (type.slice(0, splitPos) !== namespace) return
      const localType = type.slice(splitPos);
      // 代理local至namespace全局
      Object.defineProperty(gettersProxy, localType, {
        get: () => store.getters[type],
        enumerable: true
      });
    });

  // 返回代理对象
  return gettersProxy;
}
