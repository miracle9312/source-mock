<template>
    <div>
        <table border=2>
            <tr v-for="row in tableData">
                <td
                        v-for="item in row"
                        v-if="item.colspan!==0 && item.rowspan!==0"
                        :colspan="item.colspan && item.colspan"
                        :rowspan="item.rowspan && item.rowspan"
                        width="20px"
                        height="20px"
                >
                    <div v-html="item.content"></div>
                </td>
            </tr>
        </table>
        <table-selector></table-selector>
    </div>
</template>

<script>
  import TableSelector from "./vuex/table-selector";
  import { tableNormal } from "./vuex/table-config";

  export default {
    name: "app",
    data () {
      return {
        tableData: tableNormal,
        mergeArea: [[[0, 0], [0, 3]], [[2, 2], [3, 3]]]
      };
    },
    created () {
      this.mergeTableData();
    },
    methods: {
      mergeTableData () {
        this.mergeArea.forEach((area) => {
          const startPoint = area[0];
          const endPoint = area[1];
          const rowspan = endPoint[0] - startPoint[0] + 1;
          const colspan = endPoint[1] - startPoint[1] + 1;
          this.tableData.forEach((row, rowNum) => {
            row.forEach((item, colNum) => {
              if ((startPoint[0] <= rowNum && rowNum <= endPoint[0]) &&
                (startPoint[1] <= colNum && colNum <= endPoint[1])) { // 合并单元格区域内的单元
                const cell = this.tableData[rowNum][colNum];
                cell.rowspan = 0;
                cell.colspan = 0;
                cell.content = "<p>单元格内容</p>";
              }
            });
          });
          // 在起点单元格的设置合并区域
          const startCell = this.tableData[startPoint[0]][startPoint[1]];
          startCell.colspan = colspan;
          startCell.rowspan = rowspan;
        });
      }
    },
    components: {
      TableSelector
    }
  };
</script>

<style scoped>

</style>