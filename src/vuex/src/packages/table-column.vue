<template slot-scope="table">
    <tr>
        <td>{{table.data}}</td>
    </tr>
</template>

<script>
    export default {
        name: 'StarTableColumn',
        data () {
            return {
                columnData: function (){
                   return this.table.tableData
                }
            }
        }

    }
</script>

<style scoped>

</style>
