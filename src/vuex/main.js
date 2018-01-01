/**
 * Created by miracle on 2017/12/18.
 */
import { mapActions, mapGetters, mapState } from "vuex";
import Vue from "vue";
import store from "./src/vuex";

Vue.component(
    "global-component",
    { template: "<div>defined is a global component</div>" }
);

new Vue({
    el: "#app",
    store,
    computed: {
        ...mapState("mb", ["person"]),
        ...mapGetters("ma", ["personAge"])
    },
    template: `<div class="app">
                    <global-component></global-component>
                    <p>personAge: {{personAge}}</p>
                    <button @click = "addPersonProperty">addProperty</button>
                    <button @click = "addPersonAge">addPersonAge</button>
                    <button @click = "actionD">lgSameTest</button>
                    <button @click = "actionC">actionC</button>
                </div>`,
    methods: {
        ...mapActions("mb", [
            "actionA",
            "actionB",
            "actionC",
            "addPersonProperty",
            "addPersonAge"
        ]),
        ...mapActions("ma", ["actionD"])
    }
});

