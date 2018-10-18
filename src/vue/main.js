/**
 * Created by miracle on 2017/12/18.
 */
import App from "./app";
import Vue from "vue";
import Vuex from "./vuex/src";

const store = new Vuex.Store({
  state: { count: 1 },
  mutations: {
    add (state, number) {
      state.count += number;
    }
  }
});

Vue.use(Vuex);

new Vue({
  store,
  render: (h) => h(App)
}).$mount("#app");
