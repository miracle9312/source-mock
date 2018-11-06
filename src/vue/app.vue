<template>
    <div>
        <div>count:{{count}}</div>
        <div>getterCount:{{square}}</div>
        <button @click="mutAdd(1)">mutAdd</button>
        <button @click="actAdd(1)">actAdd</button>
    </div>
</template>

<script>
  import vuex from "./vuex/src";
  export default {
    name: "app",
    computed: {
      ...vuex.mapState(["count"]),
      ...vuex.mapGetters(["square"])
    },
    methods: {
      ...vuex.mapMutations({ mutAdd: "add" }),
      ...vuex.mapActions({ actAdd: "add" })
    }
  };
</script>

<style scoped>

</style>