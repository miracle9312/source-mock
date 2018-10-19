<template>
    <div>
        count:{{state.count}}
        <test-install-child></test-install-child>
        <button @click="add">add</button>
    </div>
</template>

<script>
  import TestInstallChild from "./vuex/example/text-install-child";
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
    },
    components: { TestInstallChild }
  };
</script>

<style scoped>

</style>