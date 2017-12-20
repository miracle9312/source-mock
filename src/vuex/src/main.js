/**
 * Created by miracle on 2017/12/18.
 */
import Vue from 'vue';
import Vuex from "vuex";
import app from "./components/app"

Vue.use(Vuex);

const store = new Vuex.Store({
    state: {
        count: 0
    },
    mutations: {
        increment () {
            store.state.count++
        }
    }
});

Vue.component("global-component", {
    template: "<div>defined is a global component</div>"
});

new Vue({
    el: '#app',
    computed: {
        count () {
            return store.state.count;
        }
    },
    components: {'app':app},
    methods: {
        increment () {
            store.commit("increment");
        }
    }
});


