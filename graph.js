var Constants = {
    numberOfRows: 11,
    numberOfColumns: 11,
    cellSize: 44,
    blockColor: "#2ecc71",
    catColor: "#DC143C",
    numberOfBlocks: 20,
};


/**
 * Creates an HTML table representing canvas and inserts it into HTML.
 */
function createCanvas() {
    var canvasTable = $("<table>", {id: "canvas-table"});
    var canvasTableHead = $("<thead>");
    // add rows and columns
    for (var rowIndex = 0; rowIndex < Constants.numberOfRows; rowIndex++) {
        // make a row
        var canvasRow = $("<tr>");
        for (var columnIndex = 0; columnIndex < Constants.numberOfColumns; columnIndex++) {
            // make a cell
            var canvasCell = $("<td>");
            canvasRow.append(canvasCell);
        }
        canvasTableHead.append(canvasRow);
    }
    canvasTable.append(canvasTableHead);
    // add table to HTML
    $("#canvas-container").append(canvasTable);

    // set size of cells
    $("#canvas-table td").css({
        width: Constants.cellSize,
        height: Constants.cellSize,
    });
}


/**
 * Creates and returns 2d array represnting game grid.
 * Initializes each cell to an object with and isAlive as false 0 liveNeighbors.
 */
function createGameGrid() {
    var grid = new Array(Constants.numberOfRows);
    for (var row = 0; row < Constants.numberOfRows; row++) {
        grid[row] = new Array(Constants.numberOfColumns);
        for (var col = 0; col < Constants.numberOfColumns; col++) {
            grid[row][col] = {
                state: 0,
                liveNeighbors: 0,
                bool: false,
                distance: 1000,
                indexRow: row,
                indexColumn: col,
                parent: null,

            };
        }
    }
    return grid;
}


/**
 * Executes when entire HTML document loads.
 */
$(document).ready(function() {
    createCanvas();
    var gameGrid = createGameGrid();

    $("#easy").click(function () {
       Constants.numberOfBlocks = 34;
       clearBoard(gameGrid);

    });
    $("#medium").click(function () {
       Constants.numberOfBlocks = 25;
       clearBoard(gameGrid);
    });
    $("#hard").click(function () {
       Constants.numberOfBlocks = 20;
       clearBoard(gameGrid);
    });
    clearBoard(gameGrid);

    $("#Reset").click(function () {
       clearBoard(gameGrid);
    });

    $(function() {
        $("#canvas-table tr td").click(function () {
            var col = this.cellIndex;
            var row = this.parentNode.rowIndex;
            var catRow = findCatRow(gameGrid);
            var catCol = findCatCol(gameGrid);

                if (gameGrid[row][col].state == 0) {
                    setCellState("alive", gameGrid, row, col);
                    if (countLiveNeighbors(gameGrid, catRow, catCol) == 8) {
                      alert("You saved Christmas!");
                      clearBoard(gameGrid);
                    }
                    else if(catRow == 0 || catCol == 0 || catRow == Constants.numberOfRows - 1 ||
                        catCol == Constants.numberOfColumns - 1) {
                        alert("You ruined Christmas!");
                        clearBoard(gameGrid);

                    }
                    else {
                        moveCat(gameGrid, catRow, catCol);

                    }
                }

        });
    });

})

function getCanvasCellAtIndex(rowIndex, columnIndex) {
    return $("#canvas-table tr:eq(" + rowIndex + ") td:eq(" + columnIndex + ")");
}

/**
 * Requires: grid is a 2d array representing game grid
 *           0 <= row && row < Constants.numberOfRows
 *           0 <= col && col < Constants.numberOfColumns
 *           state is set to the string "alive" or the string "dead"
 * Modifies: grid and HTML table representing the grid
 * Effects:  Sets isAlive field in cell of grid to either true or false,
 *           depending on the value of state.
 *           Updates backgroundColor of cell in HTML table.
 */
function setCellState(state, grid, row, col) {
  if (state == "alive") {
        grid[row][col].state = 1;
        getCanvasCellAtIndex(row, col).css("backgroundColor", Constants.blockColor);
        getCanvasCellAtIndex(row, col).css("backgroundImage", "url(trees.jpg)");
  }

    else if (state == "cat") {
        grid[row][col].state = 2;
        getCanvasCellAtIndex(row, col).css("backgroundImage", "url(rudolf.gif)");
    }

    else {
        grid[row][col].state = 0;
        getCanvasCellAtIndex(row, col).css("backgroundColor", "#ffffff");
        getCanvasCellAtIndex(row, col).css("backgroundImage", "none");
    }
}


// Steal countLiveNeighbors for the observance of obstructions
function countLiveNeighbors(grid, row, col) {
  var emptyCell = 0;
    var tl = true;
    var tm = true;
    var tr = true;
    var ml = true;
    var mm = true;
    var mr = true;
    var bl = true;
    var bm = true;
    var br = true;

    if (row - 1 < 0) {
    tl = false;
    tm = false;
    tr = false;
    }

    if (row + 1 >= Constants.numberOfRows) {
        bl = false;
        bm = false;
        br = false;
    }

    if (col - 1 < 0) {
    tl = false;
    ml = false;
    bl = false;
    }

    if (col + 1 >= Constants.numberOfColumns) {
    tr = false;
    mr = false;
    br = false;
    }

    if (tl) {
        if (grid[row - 1][col - 1].state == 1) {
        emptyCell++;
        }
    }

    if (tm) {
        if (grid[row - 1][col].state == 1) {
        emptyCell++;
        }
    }

    if (tr) {
        if (grid[row - 1][col + 1].state == 1) {
        emptyCell++;
        }
    }

    if (mr) {
        if (grid[row][col + 1].state == 1) {
        emptyCell++;
        }
    }

    if (br) {
        if (grid[row + 1][col + 1].state == 1) {
        emptyCell++;
        }
    }

    if (bm) {
        if (grid[row + 1][col].state == 1) {
        emptyCell++;
        }
    }

    if (bl) {
        if (grid[row + 1][col - 1].state == 1) {
        emptyCell++;
        }
    }

    if (ml) {
        if (grid[row][col - 1].state == 1) {
        emptyCell++;
        }
    }
    return emptyCell;
}


// Weighting of Cells based off of obstructions and distance to edge
function weightCells(grid, row, col) {
    var cellWeight;


    if (grid[row][col].state == 1) {
        cellWeight = 2000;
        return cellWeight;
    }

 if(row == 0 || col == 0 || row == Constants.numberOfRows - 1 ||
    col == Constants.numberOfColumns - 1) {
      cellWeight = 0;
      return cellWeight;
    }
if(row < Constants.numberOfRows/2) {
          rowDistance = row * 2;
  }
  else {
          rowDistance = (Constants.numberOfRows - row) * 2;
  }
  if(col < Constants.numberOfColumns/2) {
          colDistance = col * 2;
  }
  else {
          colDistance = (Constants.numberOfColumns - col) * 2;
  }
    return countLiveNeighbors(grid, row, col) + rowDistance + colDistance;
}




// Find Cat Row
function findCatRow(grid) {
    for (var i = 0; i < Constants.numberOfRows; i++) {
       for (var j = 0; j < Constants.numberOfColumns; j++) {
           if (grid[i][j].state == 2) {
               return i;
           }
       }
    }
}

// Find Cat Column
function findCatCol(grid) {
    for (var i = 0; i < Constants.numberOfRows; i++) {
       for (var j = 0; j < Constants.numberOfColumns; j++) {
           if (grid[i][j].state == 2) {
               return j;
           }
       }
    }
}




// Clear Board Function
function clearBoard(grid) {
    for (var i = 0; i < Constants.numberOfRows; i++) {
        for (var j = 0; j < Constants.numberOfColumns; j++) {
                setCellState("clear", grid, i, j);

            }
        }
    setCellState("cat", grid, 5, 5);
    for(var i = 0; i < Constants.numberOfBlocks; i++) {


        var newRow = Math.floor(Math.random() * Constants.numberOfRows);
        var newCol = Math.floor(Math.random() * Constants.numberOfColumns);
        setCellState("alive", grid, newRow, newCol);
      }
      setCellState("cat", grid, 5, 5);
}

function checkEdge(grid, row, col) {
  if(row == 0 || col == 0 || row == Constants.numberOfRows - 1 ||
  col == Constants.numberOfColumns - 1) {
    return true;
  }
  return false;
}

function checkNext(grid, row, col, row2, col2) {
  if(row-1==row2) {
    if(col-1==col2 || col == col2 || col+1==col2) {
      return true;
    }
  }
  if(row==row2) {
    if(col-1==col2 || col+1==col2) {
      return true;
    }
  }
  if(row+1==row2) {
    if(col-1==col2 || col == col2 || col+1==col2) {
      return true;
    }
  }

  return false;

}

// Move Cat
function moveCat(grid, catRow, catCol) {
   var queue = [];
    queue.push(grid[catRow][catCol]);
    grid[catRow][catCol].bool = true;
    grid[catRow][catCol].distance = 0;

      while(queue.length > 0) {

        var v = queue.shift();
        if(!checkEdge(grid, v.indexRow, v.indexColumn)) {
        for (var i = v.indexRow - 1; i <= v.indexRow + 1; i++) {
           for (var j = v.indexColumn - 1; j <= v.indexColumn+1; j++) {

               var u = grid[i][j];


               if(u.state == 0 && !u.bool) {

                 u.distance = v.distance + 1;
                 u.bool = true;
                 u.parent = v;
                 queue.push(u);

               }
           }
        }
      }


      }

      var min = grid[0][0];
      for (var i = 0; i < Constants.numberOfRows; i++) {
         for (var j = 0; j < Constants.numberOfColumns; j++) {
             if(checkEdge(grid, i, j) && grid[i][j].distance <= min.distance) {
               min = grid[i][j];
             }
         }
      }


      while (min.distance!= 1) {
        if(min.parent == null) {
          break;
        }
        else {
          min = min.parent;
        }
      }

     if(!checkNext(grid, catRow, catCol, min.indexRow, min.indexColumn)) {
        var minRow = catRow - 1;
        var minCol = catCol - 1;
        var minWeight = weightCells(grid, (catRow - 1), (catCol - 1));
        for (var i = catRow - 1; i < catRow + 2; i++) {
           for (var j = catCol - 1; j < catCol + 2; j++) {
               if (weightCells(grid, i, j) <= minWeight && grid[i][j].state != 2) {
                   minWeight = weightCells(grid, i, j);
                   minRow = i;
                   minCol = j;
               }
           }
        }
        min = grid[minRow][minCol];
      }
      setCellState("clear", grid, catRow, catCol);
      setCellState("cat", grid, min.indexRow, min.indexColumn);

      for (var i = 0; i < Constants.numberOfRows; i++) {
         for (var j = 0; j < Constants.numberOfColumns; j++) {
             grid[i][j].bool = false;
             grid[i][j].distance = 1000;
             grid[i][j].parent= null;
         }
      }



}
