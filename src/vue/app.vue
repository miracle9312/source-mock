<template>
    <div>
        <custom-table></custom-table>
    </div>
</template>

<script>
    import CustomTable from "./table/custom-table.vue";
    import CustomTableSelector from "./table/custom-table-selector.vue";

    export default {
      name: "App",
      components: {
        CustomTable,
        CustomTableSelector
      }
    };
</script>

<style>

</style>