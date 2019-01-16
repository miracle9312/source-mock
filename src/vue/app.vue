<template>
    <div class="table-root">
        <table border=2>
            <tr v-for="(row, rowNum) in computedTableData" :key="rowNum">
                <td
                        v-for="(item, colNum) in row"
                        v-if="item.colspan!==0 && item.rowspan!==0"
                        :colspan="item.colspan && item.colspan"
                        :rowspan="item.rowspan && item.rowspan"
                        :selected="item.selected"
                        :class="{'cell-selected':selectedPoint === item.id}"
                        :key="item.id"
                        width="20px"
                        height="20px"
                        @mousedown="setStartPoint(rowNum, colNum, item)"
                        @mouseup="setEndPoint(rowNum, colNum)"
                        @mousemove="setSelectArea(rowNum, colNum, item)"
                >
                    <span v-html="item.content"></span>
                </td>
            </tr>
        </table>
        <button @click="mergeCells">合并单元格</button>
        <button @click="insertItem('beforeCol')">前面插入列</button>
        <button @click="insertItem('afterCol')">后面插入列</button>
        <button @click="insertItem('beforeRow')">前面插入行</button>
        <button @click="insertItem('afterRow')">后面插入行</button>
        <button @click="deleteCol">删除列</button>
        <button @click="deleteRow">删除行</button>
    </div>
</template>

<script>
  import TableSelector from "./vuex/table-selector";
  import shortid from "shortid";
  import cloneDeep from "clone-deep";

  const initTableData = function (row, col) {
    const resData = [];
    for (let i = 0; i < row; i++) {
      resData[i] = [];
      for (let j = 0; j < col; j++) {
        resData[i].push({
          content: `<p>${i}.${j}</p>`,
          id: shortid.generate()
        });
      }
    }

    return resData;
  };
  export default {
    name: "app",
    data () {
      return {
        tableData: initTableData(6, 6),
        mergeArea: [[[0, 0], [0, 3]], [[2, 2], [3, 3]]],
        elmDown: false,
        startPoint: [],
        endPoint: [],
        selectedPoint: null
      };
    },
    computed: {
      computedTableData () {
        const that = this;
        const fakeTableData = cloneDeep(this.tableData);
        this.mergeArea.forEach((area) => {
          const startPoint = area[0];
          const endPoint = area[1];
          const rowspan = endPoint[0] - startPoint[0] + 1;
          const colspan = endPoint[1] - startPoint[1] + 1;
          fakeTableData.forEach((row, rowNum) => {
            row.forEach((item, colNum) => {
              if ((startPoint[0] <= rowNum && rowNum <= endPoint[0]) &&
                (startPoint[1] <= colNum && colNum <= endPoint[1])) { // 合并单元格区域内的单元
                const cell = fakeTableData[rowNum][colNum];
                cell.rowspan = 0;
                cell.colspan = 0;
                cell.content = "<p>单元格内容</p>";
              }
            });
          });
          // 在起点单元格的设置合并区域
          const startCell = fakeTableData[startPoint[0]][startPoint[1]];
          startCell.colspan = colspan;
          startCell.rowspan = rowspan;
        });
        fakeTableData.forEach((row, i) => {
          row.forEach((col, j) => {
            const inRowSide = i >= Math.min(that.startPoint[0], that.endPoint[0]) && i <= Math.max(that.startPoint[0], that.endPoint[0]);
            const inColSide = j >= Math.min(that.startPoint[1], that.endPoint[1]) && j <= Math.max(that.startPoint[1], that.endPoint[1]);
            if (inRowSide && inColSide) {
              fakeTableData[i][j].selected = true;
            } else {
              delete fakeTableData[i][j].selected;
            }
          });
        });

        return fakeTableData;
      }
    },
    methods: {
      setStartPoint (rowNum, colNum, item) {
        this.elmDown = true;
        this.startPoint = [rowNum, colNum];
        this.endPoint = [];
        this.selectedPoint = item.id;
      },
      setSelectArea (rowNum, colNum, item) {
        if (this.elmDown) {
          if (item.rowspan) rowNum += item.rowspan;
          if (item.colspan) colNum += item.colspan;
          this.endPoint = [rowNum, colNum];
        }
      },
      setEndPoint (rowNum, colNum) {
        this.elmDown = false;
        this.endPoint = [rowNum, colNum];
      },
      mergeCells () {
        this.mergeArea.push([this.startPoint, this.endPoint]);
      },
      insertItem (type) {
        switch (type) {
          case "beforeCol":
            this.insertCol(this.startPoint[1]);
            break;
          case "afterCol":
            this.insertCol(this.endPoint[1]);
            break;
          case "beforeRow":
            this.insertRow(this.startPoint[0]);
            break;
          case "afterRow":
            this.insertRow(this.endPoint[1]);
            break;
          default:
            return;
        }
      },
      insertCol (pos) {
        this.tableData.forEach(row => {
          row.splice(pos, 0, {
            content: "<p>新</p>",
            id: shortid.generate()
          });
        });
      },
      insertRow (pos) {
        const initRow = new Array(this.tableData[0].length).map(() => ({
          content: "<p>新</p>",
          id: shortid.generate()
        }));
        this.tableData.splice(pos, 0, initRow);
      },
      deleteCol () {
        this.tableData.forEach(row => {
          row.splice(this.startPoint[1], 1);
        });
      },
      deleteRow () {
        this.tableData.splice(this.startPoint[0], 1);
      }
    },
    components: {
      TableSelector
    }
  };
</script>

<style>
    [selected] {
        background-color: #eb5533;
    }
    td:hover {
        cursor: pointer;
    }
    .cell-selected {
        background-color: #eb5533;
        opacity: 0.6;
    }
    * {
        -webkit-user-select: none;
    }
</style>