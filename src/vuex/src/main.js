/**
 * Created by miracle on 2017/12/18.
 */
import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

const store = new Vuex.Store({
    state: {
        count: 0
    },
    mutations: {
        increment () {
            store.state.count++;
        }
    }
});

new Vue({
    el: "#app",
    computed: {
        count () {
            return store.state.count;
        }
    }
});


