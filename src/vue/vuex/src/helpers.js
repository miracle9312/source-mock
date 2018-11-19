export const mapState = normalizeNamespace((namespace, states) => {
  // 定义一个返回结果map
  const res = {};
  // 规范化state
  normalizeMap(states).forEach(({ key, val }) => {
    // 赋值
    res[key] = function mappedState () {
      let state = this.$store.state;
      let getters = this.$store.getters;
      if (namespace) {
        const module = getMouleByNamespace(this.$store, namespace)
        state = module.context.state;
        getters = module.context.getters;
      }

      return typeof val === "function"
        ? val.call(this, state, getters)
        : state[val];
    };
  });

  // 返回结果
  return res;
});

export const mapGetters = normalizeNamespace((namespace, getters) => {
  const res = {};
  normalizeMap(getters)
    .forEach(({ key, val }) => {
      val = namespace + val;
      res[key] = function mappedGetter () {
        return this.$store.getters[val];
      };
    });

  return res;
});

export const mapMutations = normalizeNamespace((namespace, mutations) => {
  const res = {};
  normalizeMap(mutations)
    .forEach(({ key, val }) => {
      res[key] = function mappedMutation (...args) {
        let commit = this.$store.commit;
        if (namespace) {
          const module = getMouleByNamespace(this.$store, namespace);
          commit = module.context.commit;
        }

        return typeof val === "function"
          ? val.apply(this, [commit].concat(args))
          : commit.apply(this, [val].concat(args));
      };
    });

  return res;
});

export const mapActions = normalizeNamespace((namespace, actions) => {
  const res = {};
  normalizeMap(actions)
    .forEach(({ key, val }) => {
      res[key] = function (...args) {
        let dispatch = this.$store.dispatch;
        if (namespace) {
          const module = getMouleByNamespace(this.$store, namespace);
          dispatch = module.context.dispatch;
        }

        return typeof val === "function"
          ? val.apply(this, [dispatch].concat(args))
          : dispatch.apply(this, [val].concat(args));
      };
    });

  return res;
});

function normalizeMap (map) {
  // 是否为数组
  return Array.isArray(map)
    ? map.map((val) => ({ key: val, val: val }))
    : Object.keys(map).map((key) => ({ key, val: map[key] }));
}

function normalizeNamespace (fn) {
  return function (namespace, map) {
    if (typeof namespace !== "string") {
      map = namespace;
      namespace = "";
    } else if (namespace.charAt(namespace.length - 1) !== "/") {
      namespace += "/";
    }

    return fn(namespace, map);
  };
}

function getMouleByNamespace (store, namespace) {
  return store._modulesNamespaceMap[namespace];
}
