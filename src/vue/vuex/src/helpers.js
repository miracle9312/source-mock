export const mapState = function (states) {
  // 定义一个返回结果map
  const res = {};
  // 规范化state
  normalizeMap(states).forEach(({ key, val }) => {
    // 赋值
    res[key] = function mappedState () {
      const state = this.$store.state;
      const getters = this.$store.getters;

      return typeof val === "function"
        ? val.call(this, state, getters)
        : state[val];
    };
  });

  // 返回结果
  return res;
};

export const mapGetters = function (getters) {
  const res = {};
  normalizeMap(getters)
    .forEach(({ key, val }) => {
      res[key] = function mappedGetter () {
        return this.$store.getters[val];
      };
    });

  return res;
};

export const mapMutations = function (mutations) {
  const res = {};
  normalizeMap(mutations)
    .forEach(({ key, val }) => {
      res[key] = function mappedMutation (...args) {
        const commit = this.$store.commit;

        return typeof val === "function"
          ? val.apply(this, [commit].concat(args))
          : commit.apply(this, [val].concat(args));
      };
    });

  return res;
};

export const mapActions = function (actions) {
  const res = {};
  normalizeMap(actions)
    .forEach(({ key, val }) => {
      res[key] = function (...args) {
        const dispatch = this.$store.dispatch;

        return typeof val === "function"
          ? val.apply(this, [dispatch].concat(args))
          : dispatch.apply(this, [val].concat(args));
      };
    });

  return res;
};

function normalizeMap (map) {
  // 是否为数组
  return Array.isArray(map)
    ? map.map((val) => ({ key: val, val: val }))
    : Object.keys(map).map((key) => ({ key, val: map[key] }));
}
