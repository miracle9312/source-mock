/**
 * Created by miracle on 2017/12/18.
 */
import Vue from "vue";
import Vuex from "vuex";
import counter from "./src/components/counter";

Vue.use(Vuex);

const store = new Vuex.Store({
    state: {
        count: 0,
        begin: "BEGIN",
        terminate: "TERMINATE",
        counting: "COUNTING"
    },
    mutations: {
        increment () {
            store.state.count++;
        }
    }
});

Vue.component("global-component", {
    template: "<div>defined is a global component</div>"
});

new Vue({
    el: "#app",
    store,
    components: {
        counter
    },
    template: `<div class="app">
                    <global-component></global-component>
                    <counter></counter>
                    <p>{{name}}}</p>
                </div>`
});

