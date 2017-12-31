/**
 * Created by miracle on 2017/12/18.
 */
import * as mutations from "./src/vuex/mutation-types";
import Vue from "vue";
import Vuex from "vuex";
import counter from "./src/components/counter";

Vue.use(Vuex);

const moduleA = {
    state: {
        count: 0,
        begin: "BEGIN",
        terminate: "TERMINATE",
        counting: "COUNTING"
    },
    getters: {
        gcount: (state) => `${state.count} getter`,
        gdoublecount: (state, getters) => `${getters.gcount} double`
    },
    mutations: {
        [mutations.INCREMENT_MUTATION] (state, data) {
            state.count += data.amount;
        }
    }
};

const moduleB = {
    state: {
        person: {
            name: "miracle",
            age: 25
        },
        asyncData: null
    },
    mutations: {
        [mutations.GROWUP_MUTATION] (state) {
            state.person = {
                ...state.person,
                appear: "handsome"
            };
        },
        [mutations.INACTIONB_MUTATION] (state, data) {
            state.asyncData = data;
        }
    },
    actions: {
        actionA ({ commit }) {
            return new Promise((resolve, reject) => {
                const time = 1000;

                setTimeout(() => {
                    resolve("input data form actionA");
                }, time);
            });
        },
        actionB ({ commit }, data) {
            return new Promise((resolve, reject) => {
                const time = 2000;

                setTimeout(() => {
                    commit(mutations.INACTIONB_MUTATION, {
                        param: data
                    });
                    resolve();
                }, time);
            });
        },
        actionC ({ dispatch, commit }) {
            return dispatch("actionA").then((val) => {
                dispatch("actionB", val);
            })
                .then(() => {
                    console.log("GAME OVER");
                });
        }
    }
};

const store = new Vuex.Store({
    modules: {
        ma: moduleA,
        mb: moduleB
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
    computed: {
        appear () {
            return store.state.person.appear;
        }
    },
    template: `<div class="app">
                    <global-component></global-component>
                    <counter></counter>
                    <p>{{appear ? appear : 'ugly'}}</p>
                    <button @click = "addPersonProperty">add</button>
                </div>`,
    methods: {
        addPersonProperty () {
            store.commit({
                type: mutations.GROWUP_MUTATION
            });
        }
    }
});

