import React from "react";
import ReactDOM from "react-dom";
import { hot } from "react-hot-loader";

import "../style/Minesweeper.css";

const Smiley = ({...props}) => {
  const {smiling, dead} = props;

  const skinColor = "yellow";
  const featuresColor = "black";
  const radius = 40;
  const minXY = Math.floor(radius*1.1);

  const eyeRadius = 8;
  const eyeRx = 1.5*eyeRadius;
  const eyeRy = -1*eyeRadius;
  const eyeLx = -eyeRx;
  const eyeLy = eyeRy;

  const mouthWidth = 1.4*2*eyeRadius;
  const mouthHeight = 2*eyeRadius;
  const mouthX = 0;
  const mouthY = 1*mouthHeight;

  return(
    <svg viewBox={`-${minXY} -${minXY} ${2*minXY} ${2*minXY}`} id="smileySvg">
      <defs>
        <React.Fragment>
          // Eyes
          {dead ?
              <g id="eye">
                <rect x={-eyeRadius} y={-eyeRadius/4} width={eyeRadius*2} height={eyeRadius/2} transform="rotate(45)"/>
                <rect x={-eyeRadius} y={-eyeRadius/4} width={eyeRadius*2} height={eyeRadius/2} transform="rotate(-45)"/>
              </g> :
           smiling ?
              <rect x={-eyeRadius} y={-eyeRadius/2} width={eyeRadius*2} height={eyeRadius} id="eye"/> :
              <circle r={eyeRadius} fill={featuresColor} id="eye"/>
          }

          // Mouth
          {dead ?
            <path d={`M -${mouthWidth/2} ${mouthHeight/2} c ${mouthWidth/2} -${mouthHeight*2}, ${mouthWidth} 0, ${mouthWidth} 0`} strokeWidth={eyeRadius/2} fill="none" id="mouth" /> :
           smiling ?
            <path d={`M -${mouthWidth/2} -${mouthHeight/2} c ${mouthWidth/2} ${mouthHeight}, ${mouthWidth} 0, ${mouthWidth} 0`} strokeWidth={eyeRadius/2} fill="none" id="mouth" /> :
            <ellipse rx={mouthWidth/2} ry={mouthHeight/2} fill={featuresColor} id="mouth" />
          }
        </React.Fragment>
      </defs>
      // Head
      <circle r={radius} stroke={featuresColor} strokeWidth="2" fill={skinColor}/>
      // Eyes
      <use xlinkHref="#eye" x={eyeLx} y={eyeLy} id="eyel" stroke={featuresColor}/>
      <use xlinkHref="#eye" x={eyeRx} y={eyeRy} id="eyer" stroke={featuresColor}/>
      // Mouth
      <use xlinkHref="#mouth" x={mouthX} y={mouthY} stroke={featuresColor}/>
    </svg>
  );
}

export default hot(module)(Smiley);
