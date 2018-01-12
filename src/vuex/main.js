/**
 * Created by miracle on 2017/12/18.
 */
import { mapActions, mapGetters, mapState } from "vuex";
import Vue from "vue";
import counter from "./src/components/counter";
import store from "./src/vuex";

Vue.component(
    "global-component",
    { template: "<div>defined is a global component</div>" }
);

new Vue({
    el: "#app",
    data: { name: "miracle" },
    store,
    computed: {
        ...mapState("mb", ["person"]),
        ...mapGetters("ma", ["personAge"])
    },
    components: { "counter-compontent": counter },
    template: `<div class="app">
                    <global-component></global-component>
                    <p>personAge: {{personAge}}</p>
                    <button @click = "addPersonProperty">addProperty</button>
                    <button @click = "addPersonAge">addPersonAge</button>
                    <button @click = "actionD">lgSameTest</button>
                    <button @click = "actionC">actionC</button>
                    <counter-compontent 
                        :message = "name" 
                        @changeName = "changeName"
                    ></counter-compontent>
                    <button @click = "changeName">changename</button>
                </div>`,
    methods: {
        ...mapActions("mb", [
            "actionA",
            "actionB",
            "actionC",
            "addPersonProperty",
            "addPersonAge"
        ]),
        ...mapActions("ma", ["actionD"]),
        changeName () {
            this.name = "super miracle";
        }
    }
});
