export const mapState = function (states) {
  // 定义一个返回结果map
  const res = {};
  // 规范化state
  normalizeMap(states).forEach(({ key, val }) => {
    const state = this.$store.state;
    const getters = this.$store.getters;
    // 赋值
    res[key] = function mappedState () {
      return typeof val === "function"
        ? val.call(this, state, getters)
        : state[val];
    };
  });

  // 返回结果
  return res;
};

export const mapGetters = function (states) {
  const res = {};
  normalizeMap(states)
    .forEach(({ key, val }) => {
      res[key] = function mappedGetter () {
        return this.$store.getters[val];
      };
    });

  return res;
};

function normalizeMap (map) {
  // 是否为数组
  return Array.isArray(map)
    ? map.map((val) => ({ [val]: val }))
    : Object.keys(map).map((key) => ({ key: map[key] }));
}
