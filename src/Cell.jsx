/*
  NOTES:
    SVG text alignment is achieved through the use of the textAnchor and
    dominantBaseline attributes. Nonetheless, this is implemented quite
    differently across browsers. Therefore, what might seem aligned in one
    browser, might be completely misaligned in another. For cross-browser
    compatibility, it is best to manually adjust alignment using dx and dy.
    There is a library called Fonts.js that apparently does that for you, but
    I've yet to check it out.
    References:
    http://bl.ocks.org/eweitnauer/7325338
    https://vanseodesign.com/web-design/svg-text-baseline-alignment/
*/
import React, { Component } from "react";
import ReactDOM from "react-dom";
import { hot } from "react-hot-loader";

import "../style/Minesweeper.css";

const Cell = ({...props})  => {
  let {posX,
       posY,
       onLeftClick,
       onRightClick,
       onMouseOver,
       id,
       isFlagged,
       isExplored,
       isBomb,
       bombCount,
       cellSize} = props;

  let onClick = (e) => {
    // Once explored, the cell has no more actions
    if(!isExplored){
      if(!isFlagged){
        if(onLeftClick && e.button === 0){
          onLeftClick(e);
        }
      }
      if(onRightClick && e.button === 2){
        onRightClick(e);
      }
    }
  };

let getStrokeColor = () => {
 const colors = {
   1 : "blue",
   2 : "green",
   3 : "yellow",
   4 : "magenta",
   5 : "darkturquoise",
   6 : "orange",
   7 : "pink",
   8 : "purple"
 }

 if (isBomb && isExplored){
   return "black";
 }
 else if (isFlagged) {
    return "red";
 }
 else{
   return colors[bombCount];
 }
}

let getClass = () => {
  if(isExplored){
    if(isFlagged && isBomb){
      return "flaggedCell";
    }
    else if (isBomb) {
      return "explodedCell";
    }
    else{
      return "exploredCell";
    }
  }
  return "hiddenCell";
}

let getChar = () => {
  if(isFlagged){
    return "F";
  }
  else if (isExplored) {
    if(isBomb){
      return "B";
    }
    else if (bombCount > 0) {
      return "" + bombCount + "";
    }
  }

  return "";
}

  return(
    <g>
      <rect x={posX * cellSize}
            y={posY * cellSize}
            width={cellSize}
            height={cellSize}
            onClick={onClick}
            onContextMenu={onClick}
            onMouseOver={onMouseOver}
            id={id}
            className={getClass()}
            />
          <text x={posX*cellSize + cellSize/2}
            y={posY*cellSize + cellSize/2}
            width={cellSize}
            height={cellSize}
            className="infoText"
            stroke={getStrokeColor()}
            fill={getStrokeColor()}
            pointerEvents="none">
        {getChar()}
      </text>
    </g>
  );
}

export default hot(module)(Cell);
