import React, { Component } from "react";
import ReactDOM from "react-dom";
import { hot } from "react-hot-loader";

import "../style/Minesweeper.css";
import Cell from "./Cell.jsx";
import Smiley from "./Smiley.jsx";

const toCellId = (row = 0, col = 0) => {
  return `${row},${col}`;
};

const getCellXY = (cellId = "0,0") => {
  const xy = cellId.split(",");
  return {
    x : parseInt(xy[0]),
    y : parseInt(xy[1])
  };
};

// getCellsById fetches cells based on their ID. Non-existent IDs are ignored.
// Returns an array of cells.
const getCellsById = (...ids) => (cells = {}) => {
  const retVal = ids.reduce(
          (accum, id) => id in cells ?
                          [...accum, cells[id]] :
                          accum,
          []
         );
  return retVal;
};

const emptyCell =
  (id = "0,0",
  posX = 0,
  posY = 0,
  onLeftClick = () => undefined,
  onRightClick = () => undefined,
  onMouseOver = () => undefined) => {
    return {
      id,
      posX,
      posY,
      onLeftClick,
      onRightClick,
      onMouseOver,
      isFlagged  : false,
      isExplored : false,
      isBomb     : false,
      bombCount  : 0
    };
  }

  // Get the presumed neighbor IDs. Note that this may not return OOB IDs.
  // If the target cell has no neighbors, an empty array is returned.
const getNeighborIds = (id = "0,0") => (cells = {}) => {
  let xy = getCellXY(id);
  let retVal = [];
  for(let x = xy.x - 1; x <= xy.x + 1; x++){
    for(let y = xy.y - 1; y <= xy.y + 1; y++){
      const neighborId = toCellId(x, y);
      if(neighborId !== id && neighborId in cells){
        retVal.push(neighborId);
      }
    }
  }
  return retVal;
};

const exploreCells = (id = "0,0") => (cells = {}) => {
  // This function uses a variation of the Flood Fill algorithm to explore cells
  // in the event that the selected cell was blank (no surrounding bombs).
  // https://en.wikipedia.org/wiki/Flood_fill
  let exploredCells = {...cells};
  let pendingExplore = [id];

  let [cell] = getCellsById(pendingExplore.pop())(exploredCells);
  if(cell.isBomb){
    // If the explored cell is a bomb, all bombs explode (are explored).
    const bombCells = getCellsById(...Object.keys(exploredCells))(exploredCells)
                        .filter(cell => cell.isBomb);
    bombCells.forEach(cellRef => cellRef.isExplored = true);
  }
  else{
    // While there are pending cells to explore.
    // This occurs when a cell with 0 neighboring bombs is explored
    while(cell){
      cell.isExplored = true;
      if(cell.bombCount === 0){
        // Get neighor IDs for cells which haven't been explored, aren't bombs and
        // exist as valid neighbors within our grid.
        const neighborIds = getNeighborIds(cell.id)(exploredCells);
        // NOTE: getCellsById returns an array of references.
        // Since exploredCells is a copy of cells, mutating it is not a problem.
        const neighborsToExplore =  getCellsById(...neighborIds)(exploredCells)
                                      // Select neighbors which haven't been explored and aren't bombs
                                      .filter(cell => !cell.isExplored)
                                      .filter(cell => !cell.isBomb);
        // Mark each of the neighbors to explore as visited to avoid duplicate reveals
        neighborsToExplore.forEach(cell => cell.isExplored = true);
        // Add the neighbors to explore IDs to the pending explore queue
        pendingExplore.push(...neighborsToExplore.map(cell => cell.id));
      }

      [cell] = getCellsById(pendingExplore.pop())(exploredCells);
    }
  }

  return exploredCells;
};

const lostGame = (revealId = "0,0") => (cells = {}) => {
  // The game is lost if any bomb is explored
  return cells[revealId].isBomb;
}

const wonGame = (cells = {}) => {
  // The game is won if all unexplored cells are bombs and they're all flagged.
  // A possible performance improvement may be achieved by keeping track of how
  // many unexplored cells there are and how many bombs there were initially.
  // This has not been implemented since it was deemed
  let unexploredIds = Object.keys(cells)
                            .filter(id => !cells[id].isExplored);
  return unexploredIds.every(id => cells[id].isBomb) &&
         unexploredIds.every(id => cells[id].isFlagged);
}

const flagCell = (id = "0,0") => (cells = {}) => {
  // Flagging a cell is flipping its flagged property.
  const flaggedCells = {...cells};
  getCellsById(id)(flaggedCells)
    .forEach(cell => cell.isFlagged = !cell.isFlagged);
  return flaggedCells;
}

const createNewMinefield =
  ( boardSize    = 0,
    bombCount    = 0,
    onLeftClick  = () => undefined,
    onRightClick = () => undefined,
    onMouseOver  = () => undefined ) => {
  let cells = {};
  for(let i = 0; i < boardSize; i++){
    for(let j = 0; j < boardSize; j++){
      // NOTE: j and i are reversed to organize the cells in row-major order
      let cellId = toCellId(j, i);
      cells[cellId] = emptyCell(cellId, j, i, onLeftClick, onRightClick, onMouseOver);
    }
  }

  // Initially, none of the cells are bombs
  let cellIds = Object.keys(cells);
  // If more bombs than available cells were requested, bound this to avoid an error.
  // At least one empty cell (center) is necessary for every 9-cell grid.
  if(bombCount > cellIds.length * 8/9){
    bombCount = Math.floor(cellIds.length * 8/9);
  }

  for(let i = 0; i < bombCount; i++){
    let bombAdded = false;
    while(!bombAdded){
      const randCellId = cellIds[Math.floor(Math.random()*cellIds.length)];
      const [randCell] = getCellsById(randCellId)(cells);

      const neighborIds = getNeighborIds(randCellId)(cells);
      const availableNeighbors =  getCellsById(...neighborIds)(cells)
                                    .filter(cell => !cell.isBomb);
      if(availableNeighbors.length > 0){
        randCell.isBomb = true;
        availableNeighbors.forEach(cell => cell.bombCount++);
        bombAdded = true;
      }
      // Remove the randomly selected cell after evaluation. Regardless of
      // whether or not a bomb was added (bombs won't always be added when
      // the minefield is saturated), this cell is no longer elegible to hold a
      // bomb.
      cellIds = cellIds.filter(id => id != randCellId);
    }
  }

  return cells;
}

const getBoardSize = (difficulty = "easy") => {
  const boardSize = {
    "easy" : 8,
    "normal" : 16,
    "hard" : 24
  };

  return boardSize[difficulty];
}

const getMaxBombs = (difficulty = "easy") => {
  const maxBombs = {
    "easy" : 10,
    "normal" : 40,
    "hard"   : 99
  };

  return maxBombs[difficulty];
}

class Minesweeper extends Component{
  constructor(props){
    super(props);
    this.cellSize = 10

    // Since most of our functions are pure, there is no need to rebind their
    //scope here.
    // Only the functions that comprise our component's interface have been
    // declared as class functions and bound here.
    this.onLeftClick = this.onLeftClick.bind(this);
    this.onRightClick = this.onRightClick.bind(this);
    this.onMouseOver = this.onMouseOver.bind(this);
    this.resetGame = this.resetGame.bind(this);
    this.handleDifficultyChange = this.handleDifficultyChange.bind(this);

    // TODO: difficulty settings
    this.state = {
      boardSize : getBoardSize("easy"),
      difficulty: "easy",
      maxBombs : getMaxBombs("easy"),
      cells : {},
      won : false,
      lost : false
    };
  }

  onLeftClick(e){
    // Left click action: explore a cell. Evaluate game end conditions after
    // exploration is complete.
    const targetId = e.target.id;

    let {cells} = this.state;
    cells = exploreCells(targetId)(cells);
    const lost = lostGame(targetId)(cells);
    // Minor performance improvement: do not evaluate win condition if known
    // loss.
    const won = lost ? false : wonGame(cells);

    this.setState({
      ...this.state,
      cells,
      lost,
      won
    });
  }

  onRightClick(e){
    // Right click action: flag a cell. Evalulate victory condition after
    // flagging.
    // NOTE: all bombs should be flagged as a victory condition.
    const targetId = e.target.id;
    let {cells} = this.state;
    cells = flagCell(targetId)(cells);
    const won = wonGame(cells);

    this.setState({
      ...this.state,
      cells,
      won
    });
  }

  onMouseOver(e){
    // Placeholder
    // console.log("Mouse over " + e.target.id);
  }

  componentDidMount(){
    // The game is reset after it has mounted. resetGame calls this.setState,
    // which is not possible before this point.
    const {resetGame} = this;
    const {difficulty} = this.state;
    resetGame(difficulty);
  }

  resetGame(difficulty = "easy"){
    // Resetting implies creating a brand new minefield.
    const {onLeftClick, onRightClick, onMouseOver} = this;
    const boardSize = getBoardSize(difficulty);
    const maxBombs = getMaxBombs(difficulty);
    const newMinefield = createNewMinefield(boardSize,
                                            maxBombs,
                                            onLeftClick,
                                            onRightClick,
                                            onMouseOver);

    this.setState({ ...this.state,
                    difficulty,
                    boardSize,
                    maxBombs,
                    cells : newMinefield,
                    won   : false,
                    lost  : false});
  }

  handleDifficultyChange(event){
    let {difficulty} = this.state;
    const {resetGame} = this;

    if(difficulty != event.target.value){
      difficulty = event.target.value;
      resetGame(difficulty);
    }
  }

  render(){
    const {resetGame, cellSize, handleDifficultyChange} = this;
    const {boardSize, cells, won, lost, difficulty} = this.state;
    const gameOver = won || lost;
    const svgViewBox = boardSize*cellSize;
    return(
      <React.Fragment>
        <div id="gameWrapper">
          <div className="title">
            <h1>Minesweeper</h1>
          </div>
          <div id="statusBar">
            <div>Remaining Bombs</div>
            <div>
              <select name="difficulty" value={difficulty} onChange={handleDifficultyChange}>
                <option value="easy">Easy</option>
                <option value="normal">Normal</option>
                <option value="hard">Hard</option>
              </select>
              <button submit={null} onClick={() => resetGame(difficulty)} id="smileyBtn">
                <Smiley smiling={won} dead={lost} />
              </button>
            </div>
            <div>Timer</div>
          </div>
          <div>
            <svg viewBox={`0 0 ${svgViewBox} ${svgViewBox}`} id="game_area"
              pointerEvents={gameOver ? "none" : "all"}>
              <g id="gameElems">
                // Normally, one wouldn't map an object in JSX because ordering tends
                // to be important for rendering and Object.keys does not guarantee order,
                // but this is a game and elements are rendered at their respective
                // positions, not one after the other as they're instantiated :)
                {Object.keys(cells).map(
                  cellId => <Cell key={cellId} {...cells[cellId]} cellSize={cellSize}/>)}
              </g>
            </svg>

          </div>
        </div>
      </React.Fragment>
    );
  }
}

ReactDOM.render(
  <Minesweeper />,
  document.getElementById("minesweeper_react_root")
)


// Disable right-click contextmenu default
document.addEventListener("contextmenu", (e) => {e.preventDefault()});

export default hot(module)(Minesweeper);
