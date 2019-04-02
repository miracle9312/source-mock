<template>
    <div class="table-root">
        <table border=2>
            <tr :data-row="rowNum" v-for="(row, rowNum) in computedTableData" :key="rowNum">
                <td
                        v-for="(item, colNum) in row"
                        v-if="item.colspan!==0 && item.rowspan!==0"
                        :colspan="item.colspan && item.colspan"
                        :rowspan="item.rowspan && item.rowspan"
                        :selected="item.selected"
                        :class="{'cell-selected':selectedPoint === item.id}"
                        :key="item.id"
                        :data-key="item.id"
                        width="20px"
                        height="20px"
                        :data-row="colNum"
                        @mousedown="setStartPoint(rowNum, colNum, item)"
                        @mouseup="setEndPoint(rowNum, colNum, item)"
                        @mousemove="setSelectArea(rowNum, colNum, item)"
                        :style="{'background-color': item.cellStyle && item.cellStyle.color}"
                >
                    <div v-html="item.content"></div>
                </td>
            </tr>
        </table>
        <button @click="mergeCells">合并单元格</button>
        <button @click="departCells">拆分单元格</button>
        <button @click="insertItem('beforeCol')">前面插入列</button>
        <button @click="insertItem('afterCol')">后面插入列</button>
        <button @click="insertItem('beforeRow')">前面插入行</button>
        <button @click="insertItem('afterRow')">后面插入行</button>
        <button @click="deleteCol">删除列</button>
        <button @click="deleteRow">删除行</button>
        <button @click="setCellStyle({color: '#eb5533'})">设置颜色</button>
    </div>
</template>

<script>
  import cloneDeep from "clone-deep";
  import shortid from "shortid";

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
    name: "CustomTable",
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
                Object.assign(fakeTableData[rowNum][colNum], {
                  rowspan: 0,
                  colspan: 0
                });
              }
            });
          });
          // 在起点单元格的设置合并区域
          const startCell = fakeTableData[startPoint[0]][startPoint[1]];
          startCell.colspan = colspan;
          startCell.rowspan = rowspan;
          startCell.content = "<p>单元格内容</p>";
        });
        fakeTableData.forEach((row, i) => {
          row.forEach((col, j) => {
            const inRowSide = i >= Math.min(that.startPoint[0], that.endPoint[0]) &&
              i <= Math.max(that.startPoint[0], that.endPoint[0]);
            const inColSide = j >= Math.min(that.startPoint[1], that.endPoint[1]) &&
              j <= Math.max(that.startPoint[1], that.endPoint[1]);
            if (inRowSide && inColSide) {
              fakeTableData[i][j].selected = true;
            } else if (fakeTableData[i][j].selected) {
              fakeTableData[i][j].selected = false;
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
          this.$set(this.endPoint, "0", item.rowspan ? item.rowspan + rowNum - 1 : rowNum);
          this.$set(this.endPoint, "1", item.colspan ? item.colspan + colNum - 1 : colNum);
        }
      },
      setEndPoint (rowNum, colNum, item) {
        this.elmDown = false;
        this.$set(this.endPoint, "0", item.rowspan ? item.rowspan + rowNum - 1 : rowNum);
        this.$set(this.endPoint, "1", item.colspan ? item.colspan + colNum - 1 : colNum);
      },
      mergeCells () {
        const startPointX = Math.min(this.startPoint[0], this.endPoint[0]);
        const startPointY = Math.min(this.startPoint[1], this.endPoint[1]);
        const endPointX = Math.max(this.startPoint[0], this.endPoint[0]);
        const endPointY = Math.max(this.startPoint[1], this.endPoint[1]);
        this.mergeArea.forEach((area, i) => {
          if (this.isIncludeCell([[startPointX, startPointY], [endPointX, endPointY]], area)) {
            this.mergeArea.splice(i, 1);
          }
        });
        this.mergeArea.push([[startPointX, startPointY], [endPointX, endPointY]]);
      },
      departCells () {
        this.mergeArea.forEach((area, i) => {
          if ((area[0][0] === this.startPoint[0] && area[0][1] === this.startPoint[1]) &&
            (area[1][0] === this.endPoint[0] && area[1][1] === this.endPoint[1])) {
            this.mergeArea.splice(i, 1);
          }
        });
      },
      isIncludeCell (parent, nest) {
        return (parent[0][0] <= nest[0][0] && parent[0][1] <= nest[0][1]) &&
          (parent[1][0] >= nest[1][0] && parent[1][1] >= nest[1][1]);
      },
      insertItem (type) {
        switch (type) {
          case "beforeCol":
            this.insertCol(this.startPoint[1]);
            this.startPoint[1]++;
            this.endPoint[1]++;
            break;
          case "afterCol":
            this.insertCol(this.endPoint[1] + 1);
            break;
          case "beforeRow":
            this.insertRow(this.startPoint[0]);
            this.startPoint[0]++;
            this.endPoint[0]++;
            break;
          case "afterRow":
            this.insertRow(this.endPoint[0] + 1);
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
        this.crossMergeArea("col", pos, "insert");
      },
      insertRow (pos) {
        const initRow = [];
        for (let i = 0; i < this.tableData[0].length; i++) {
          initRow.push({
            content: "<p>新</p>",
            id: shortid.generate()
          });
        }
        this.tableData.splice(pos, 0, initRow);
        this.crossMergeArea("row", pos, "insert");
      },
      deleteCol () {
        this.tableData.forEach(row => {
          row.splice(this.startPoint[1], 1);
        });
        this.crossMergeArea("col", this.startPoint[1], "delete");
      },
      deleteRow () {
        this.tableData.splice(this.startPoint[0], 1);
        this.crossMergeArea("row", this.startPoint[0], "delete");
      },
      crossMergeArea (type, pos, operate) {
        this.mergeArea.forEach((area, i) => {
          const range = type === "row" ? [area[0][0], area[1][0]] : [area[0][1], area[1][1]];
          let target = type === "row" ? area[1][0] : area[1][1];
          const startTarget = type === "row" ? area[0][0] : area[0][1];
          if (range[0] <= pos && pos <= range[1]) {
            if (type === "row") {
              target = area[1][0] = operate === "insert" ? target + 1 : target - 1;
            } else {
              target = area[1][1] = operate === "insert" ? target + 1 : target - 1;
            }
            if (target < startTarget) {
              this.mergeArea.splice(i, 1);
            }
          }
        });
      },
      setCellStyle (styleObj) {
        const that = this;
        this.tableData.forEach((row, i) => {
          row.forEach((col, j) => {
            const inRowSide = i >= Math.min(that.startPoint[0], that.endPoint[0]) &&
              i <= Math.max(that.startPoint[0], that.endPoint[0]);
            const inColSide = j >= Math.min(that.startPoint[1], that.endPoint[1]) &&
              j <= Math.max(that.startPoint[1], that.endPoint[1]);
            if (inRowSide && inColSide) {
              that.$set(that.tableData[i][j], "cellStyle", styleObj);
            }
          });
        });
      }
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