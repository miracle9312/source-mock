/**
 * Created by miracle on 2017/12/18.
 */
import App from "./app";
import Vue from "vue";
import Vuex from "./vuex/src";

Vue.use(Vuex);

const store = new Vuex.Store({
  state: { count: 1 },
  getters: {
    square (state, getters) {
      return Math.pow(state.count, 2);
    }
  },
  mutations: {
    add (state, number) {
      state.count += number;
    }
  },
  actions: {
    add ({ commit }, number) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          const pow = 2;
          commit("add", Math.pow(number, pow));
          resolve(number);
        }, 1000);
      });
    }
  },
  modules: {
    a: {
      state: { countA: 9 },
      getters: {
        sqrt (state, getters) {
          return Math.sqrt(state.count);
        }
      }
    }
  }
});

new Vue({
  store,
  render: (h) => h(App)
}).$mount("#app");
