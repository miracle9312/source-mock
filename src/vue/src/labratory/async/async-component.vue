<template>
    <div>
        <div>async component</div>
        <test-a></test-a>
        <test-b></test-b>
    </div>
</template>

<script>
  import TestA from "test-a";
  import TestB from "test-b";

  export default {
    name: "async-component",
    components: {
      "test-a": TestA,
      "test-b": TestB
    }

  };
</script>

<style scoped>

</style>