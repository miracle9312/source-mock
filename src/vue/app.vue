<template>
    <div>
        app-component
        <test-install-child></test-install-child>
    </div>
</template>

<script>
  import TestInstallChild from "./vuex/example/text-install-child";
  export default {
    name: "app",
    created () {
      console.log(this);
    },
    components: { TestInstallChild }
  };
</script>

<style scoped>

</style>