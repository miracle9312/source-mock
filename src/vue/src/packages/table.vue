<template>
    <p>this is a table</p>
</template>

<script>
  export default {
    name: "StarTable",
    props: ["data"],
    watch: {
      data: {
        handler (val) {
          console.log(val);
        },
        immediate: true
      }
    }
  };
</script>

<style scoped>

</style>
