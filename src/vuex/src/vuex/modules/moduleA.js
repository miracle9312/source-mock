/**
 * Created by didi on 18/1/1.
 */
import * as types from "../mutation-types";

const state = {
    count: 0,
    begin: "BEGIN",
    terminate: "TERMINATE",
    counting: "COUNTING"
};

const getters = {
    gcount: (st) => `${st.count} getter`,
    gdoublecount: (st, gts) => `${getters.gcount} double`,
    personAge: (st, gts, rootState) => `${rootState.mb.person.age} from in moduleA`
};

const mutations = {
    [types.INCREMENT_MUTATION] (st, data) {
        st.count += data.amount;
    },
    [types.LGSAME_MUTATION] (st) {
        st.count += 2;
    }
};

const actions = {
    actionD ({ commit }) {
        commit(types.LGSAME_MUTATION);
    }
};

export default {
    namespaced: true,
    state,
    getters,
    mutations,
    actions
};
