<template>
    <div id="app">
        <div>id: {{item.id}}</div>
        <div>name: {{item.name}}</div>
    </div>
</template>

<script>
  export default {
    name: 'app',
    // asyncData({ store }) {
    //   // 触发 action 后，会返回 Promise
    //   return store.dispatch('fetchItems')
    // },
    computed: {
      // 从 store 的 state 对象中的获取 item。
      item() {
        return this.$store.state.item;
      }
    }
  };
</script>

<style scoped>

</style>
