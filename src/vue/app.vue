<template>
    <div>
        <div>count:{{count}}</div>
        <div>getterCount:{{square}}</div>
        <div>moduleSqrt:{{sqrt}}</div>
        <div>moduleCount:{{countA}}</div>
        <button @click="mutAdd(1)">mutAdd</button>
        <button @click="actAdd(1)">actAdd</button>
        <button @click="miner(1)">modMutAdd</button>
        <test-module></test-module>
        <!--<button @click="miner">actMiner</button>-->
    </div>
</template>

<script>
  import vuex from "./vuex/src";
  import TestModule from "./vuex/example/test-module";

  export default {
    name: "app",
    created () {
      console.log(this.$store);
    },
    computed: {
      ...vuex.mapState(["count"]),
      ...vuex.mapGetters(["square"]),
      ...vuex.mapGetters("a", ["sqrt"]),
      ...vuex.mapState("a", ["countA"])
    },
    components: {
      TestModule
    },
    methods: {
      // ...vuex.mapActions("a", ["miner"]),
      ...vuex.mapMutations({ mutAdd: "add" }),
      ...vuex.mapActions({ actAdd: "add" }),
      ...vuex.mapMutations("a", ["miner"])
    }
  };
</script>

<style scoped>

</style>