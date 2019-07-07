
import React, {Component} from 'react'
import map from 'lodash/map'

const rowHeight = 24;


class Cell extends Component {
  render(){
    const {col, ci, ri, onMouseDownCell, onMouseMoveCell, widthAt, positionLeft} = this.props;
    return(
        <g
           transform={`translate(${positionLeft(ci)}, 0)`}
           onMouseDown={()=>onMouseDownCell(ci, ri)}
           onMouseMove={()=>onMouseMoveCell(ci, ri)}>
          [<rect x={0} y={0} width={widthAt(ci)} height={rowHeight}></rect>,
          <text x={2} y={12} width={widthAt(ci)} height={rowHeight}>{col}</text>]
        </g>
    )
  }
}

class Rows extends Component {

  render(){
    const { data,  positionLeft, onMouseDownCell, onMouseMoveCell, widthAt} = this.props;
    const rows = map(data, (row, ri)=>
      {
      return(<g  key={ri} transform={`translate(0, ${ri * 24})`}>
        {
          map(row, (col,ci)=>(<Cell key={ri + '_' + ci}
                                    ci={ci}
                                    ri={ri}
                                    col={col}
                                    positionLeft={positionLeft}
                                    onMouseDownCell={onMouseDownCell}
                                    onMouseMoveCell={onMouseMoveCell}
                                    widthAt={widthAt} />))
        }
      </g>)
    });
    return(rows)
  }

}

class  SpreadsheetBody extends Component {

  render(){
    const {positionLeft, data, selectionSize, selectionCount, onMouseDownCell, onMouseMoveCell, widthAt} = this.props;

    return(
        <svg width={positionLeft(data.length + 1) + 1} height={data.length * 24} >
          <Rows data={data}
                    widthAt={widthAt}
                    positionLeft={positionLeft}
                    onMouseDownCell={onMouseDownCell}
                    onMouseMoveCell={onMouseMoveCell} />
          <rect transform={`translate(${positionLeft(selectionCount.c)},  ${selectionCount.r * 24})`}
                className="selection" x={0} y={0}
                width={selectionSize.w}
                height={selectionCount.h * rowHeight}>
          </rect>
        </svg>
    )
  }

}export default SpreadsheetBody;