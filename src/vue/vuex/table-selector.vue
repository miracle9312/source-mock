<template>
    <table>
        <tr
                v-for="(row, i) in tableData"
                :key="i"
        >
            <td
                    v-for="(item, j) in row"
                    :selected="item.selected"
                    :key="j"
                    @mouseover="selectTableArea(i, j)"
                    @click="confirmTableArea(i, j)"
            ></td>
        </tr>
    </table>
</template>

<script>
  const initTableData = function () {
    const row = 10;
    const column = 10;
    const resData = [];
    for (let i = 0; i < row; i++) {
      resData[i] = [];
      for (let j = 0; j < column; j++) {
        resData[i].push({ selected: false });
      }
    }

    return resData;
  };
  export default {
    name: "TableSelector",
    data () {
      return {
        tableData: initTableData()
      };
    },
    methods: {
      selectTableArea (rowNum, colNum) {
        this.tableData.forEach((row, i) => {
          row.forEach((col, j) => {
            if (i <= rowNum && j <= colNum) {
              this.tableData[i][j].selected = true;
            } else {
              this.tableData[i][j].selected = false;
            }
          });
        });
      },
      confirmTableArea (rowNum, colNum) {
        this.tableData = initTableData();
        console.log(rowNum, colNum);
      }
    }
  };
</script>

<style>
    td {
        width: 20px;
        height: 20px;
        border: 1px solid #e4e4e4
    }
    [selected] {
      background-color: #eb5533;
    }
</style>