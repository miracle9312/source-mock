<template>
    <div>
        count:{{state.count}}
        <button @click="add">add</button>
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
      }
    },
    methods: {
      add () {
        this.$store.commit("add", 2);
      }
    }
  };
</script>

<style scoped>

</style>