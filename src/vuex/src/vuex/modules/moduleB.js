/**
 * Created by didi on 18/1/1.
 */
import * as types from "../mutation-types";

const state = {
    person: {
        name: "miracle",
        age: 25
    },
    asyncData: null,
    count: 0
};

const mutations = {
    [types.GROWUP_MUTATION] (st) {
        st.person = {
            ...st.person,
            appear: "handsome"
        };
    },
    [types.INACTIONB_MUTATION] (st, data) {
        st.asyncData = data;
    },
    [types.AGERISE_MUTATION] (st) {
        st.person.age++;
    },
    [types.LGSAME_MUTATION] (st) {
        st.count += 5;
    }
};

const actions = {
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
                commit(types.INACTIONB_MUTATION, { param: data });
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
    },
    addPersonProperty ({ commit }) {
        commit({ type: types.GROWUP_MUTATION });
    },
    addPersonAge ({ commit }) {
        commit({ type: types.AGERISE_MUTATION });
    }
};

export default {
    namespaced: true,
    state,
    mutations,
    actions
};
