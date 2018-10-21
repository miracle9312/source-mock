export default function (Vue) {
  // 获取vue版本
  const version = Number(Vue.version.split(".")[0]);

  // 根据版本选择注册方式
  if (version >= 2) {
    // 版本大于2在mixin中执行初始化函数
    Vue.mixin({ beforeCreate: vuexInit });
  } else {
    // 低版本，将初始化方法放在options.init中执行
    const _init = Vue.prototype._init;

    Vue.prototype._init = function (options = {}) {
      options.init = options.init
        ? [vuexInit].concat(options.init)
        : vuexInit;
      _init();
    };
  }

  // 初始化函数:将store作为属性注入到所有组件中
  function vuexInit () {
    // 根组件
    if (this.$options && this.$options.store) {
      this.$store = typeof this.$options.store === "function"
        ? this.$options.store()
        : this.$options.store;
    } else if (this.$options.parent && this.$options.parent.$store) { // 非根组件
      this.$store = this.$options.parent.$store;
    }
  }
}
