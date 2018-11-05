<template>
    <div>
        <div>count:{{count}}</div>
        <div>getterCount:{{square}}</div>
        <button @click="add">add</button>
        <button @click="asyncAdd">asyncAdd</button>
    </div>
</template>

<script>
  import vuex from "./vuex/src";
  export default {
    name: "app",
    created () {
      console.log(this);
    },
    computed: {
      ...vuex.mapState(["count"]),
      ...vuex.mapGetters(["square"])
    },
    methods: {
      add () {
        this.$store.commit("add", 2);
      },
      asyncAdd () {
        this.$store.dispatch("add", 4).then((data) => {
          console.log(data);
        });
      }
    }
  };
</script>

<style scoped>

</style>