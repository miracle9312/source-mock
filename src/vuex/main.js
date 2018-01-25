/**
 * Created by miracle on 2017/12/18.
 */
import { mapActions, mapGetters, mapState } from "vuex";
import Vue from "vue";
import counter from "./src/components/counter";
import paragraph from "./src/components/paragraph";
import store from "./src/vuex";
import table from "./src/components/table-test";
import trans from "./src/components/transition";

Vue.component(
    "global-component",
    { template: "<div>defined a global component</div>" }
);

new Vue({
    el: "#app",
    data: { name: "miracle" },
    store,
    computed: {
        ...mapState("mb", ["person"]),
        ...mapGetters("ma", ["personAge"])
    },
    components: {
        "counter-component": counter,
        "trans-component": trans,
        "table-component": table,
        "para-component": paragraph
    },
    template: `<div class="app">
                    <para-component
                        para-title="global component" 
                    >
                        <global-component></global-component>
                    </para-component>
                    
                    <para-component
                        para-titlt="vuex"
                    >
                        <p>personAge: {{personAge}}</p>
                        <button @click = "addPersonProperty">addProperty</button>
                        <button @click = "addPersonAge">addPersonAge</button>
                        <button @click = "actionD">lgSameTest</button>
                        <button @click = "actionC">actionC</button>
                        <counter-component 
                            :message = "name" 
                            @changeName = "changeName"
                        ></counter-component>
                        <button @click = "changeName">changename</button>
                    </para-component>
      
                    <para-component
                        para-title="vue transition"
                    >
                         <trans-component></trans-component>
                    </para-component>
                    
                    <para-component
                        para-title="element table"
                    >
                         <table-component></table-component>
                    </para-component>    
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
