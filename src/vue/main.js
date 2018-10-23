/**
 * Created by miracle on 2017/12/18.
 */
import App from "./app";
import Vue from "vue";
import Vuex from "./vuex/src";

Vue.use(Vuex);

const store = new Vuex.Store({
  state: { count: 1 },
  mutations: {
    add (state, number) {
      state.count += number;
    }
  },
  actions: {
    add ({ commit }, number) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          commit("add", number);
          resolve(number);
        }, 1000);
      });
    }
  }
});

new Vue({
  store,
  render: (h) => h(App)
}).$mount("#app");
