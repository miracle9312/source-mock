<template>
    <div>
        <div>count:{{state.count}}</div>
        <div>getterCount:{{getters.square}}</div>
        <button @click="add">add</button>
        <button @click="asyncAdd">asyncAdd</button>
    </div>
</template>

<script>
  export default {
    name: "app",
    created () {
      console.log(this);
    },
    computed: {
      state () {
        return this.$store.state;
      },
      getters () {
        return this.$store.getters;
      }
    },
    methods: {
      add () {
        this.$store.commit("add", 2);
      },
      asyncAdd () {
        this.$store.dispatch("add", 4);
      }
    }
  };
</script>

<style scoped>

</style>