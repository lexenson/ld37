import React from 'react';
import {times} from 'lodash';


const Map = ({currentProperty, height, width, padding, nBlocksHigh, nBlocksWide, members, properties, handlePropertyClick}) => {
  const streetColor = "#fedcb3"
  const buildingColor = "#e19239"
  const doneColor = "#af722d"
  const streetWidth = "6"
  const blockHeight = (height - (2 * padding)) / nBlocksHigh
  const blockWidth = (width - (2 * padding)) / nBlocksWide
  return(
    <svg width={width} height={height}>
      <rect x="0" y="0" width={width} height={height} fill="#edb46f"/>
      {
        times(nBlocksHigh + 1, (i) => {
          return <line key={'h' + (blockHeight * i)} x1="0" y1={blockHeight * i + padding} x2={width} y2={blockHeight * i + padding} stroke={streetColor} strokeWidth={streetWidth} />
        })
      }
      {
        times(nBlocksWide + 1, (i) => {
          return <line key={'w' + (blockWidth * i)} x1={blockWidth * i + padding} y1="0" x2={blockWidth * i + padding} y2={height} stroke={streetColor} strokeWidth={streetWidth} />
        })
      }
      {properties.map((property) => {
        const {x, y, id, name} = property
        const member = members.find(({assignedPropertyId}) => assignedPropertyId === id)
        return <g key={x+'-'+y}>
          <rect
            className={currentProperty === id ? "pulsate" : ""}
            onClick={handlePropertyClick.bind(this, id)}
            x={x * blockWidth + padding + 10}
            y={y * blockHeight + padding + 10}
            width={blockWidth - 20}
            height={blockHeight - 20}
            fill={property.remainingTime === 0 ? doneColor : buildingColor}
          />
          <text
            x={x * blockWidth + padding + 20}
            y={(y + 0.4) * blockHeight + padding + 20}
            fontSize="13"
            fill="black"
          >{name}</text>
          {
            member ?
            <image
              href={member.picture}
              x={(x+0.3) * blockWidth + padding + 10}
              y={y * blockHeight + padding + 10}
              height="50px"
              width="50px"
            /> : null
          }
        </g>
      })}
    </svg>
  )
}

export default Map;
