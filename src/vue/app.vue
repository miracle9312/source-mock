<template>
        <star-router
                :constroller="controller"
                :routes="routes"
                :componentName="componentName"
                :compoenntData="componentData"
        ></star-router>
</template>

<script>
    // import CustomTable from "./table/custom-table.vue";
    // import CustomTableSelector from "./table/custom-table-selector.vue";
    import StarRouter from "./controller/router-view";
    import Controller from "./controller/controller";
    import routes from "./controller/routes";
    const controller = new Controller({ a: "test" });

    export default {
      name: "App",
      data () {
        return {
          controller,
          routes,
          componentName: "component-a",
          componentData: {}
        };
      },
      components: {
        StarRouter
        // CustomTable,
        // CustomTableSelector
      }
    };
</script>

<style>

</style>