import React, {Component} from 'react'
import map from 'lodash/map'

const rowHeight = 24;

class CellHeader extends Component {
  render() {
    const {widthAt,  headerResizeAt, headerResizeStart, ci, col} =this.props;

    return ([
      [<rect key={col + '-' + ci + '-1'} className="col-header" x={0} y={0} width={widthAt(ci)} height={rowHeight}></rect>,
        <text key={col + '-' + ci + '-2'} className="col-header__text" textAnchor="middle" x={widthAt(ci) / 2} y={12} width={widthAt(ci)}
              height={rowHeight}>{col.name}</text>,
        <rect key={col + '-' + ci + '-3'} className={"col-header__resize " + (ci === headerResizeAt ? 'active' : '')} x={widthAt(ci) - 5} y={0}
              width={5} height={rowHeight} onMouseDown={(e)=>{e.preventDefault(); headerResizeStart(ci)}}></rect>]
    ])
  }
}

class SpreadsheetHeader extends Component {

  render(){
    const {headerObj, startColumnSelect, changeColumnSelect, endColumnSelect, positionLeft, headerResizeAt, widthAt, headerResizeStart, data} = this.props;
    const header = map(headerObj, (col,ci) => {
      return(<g key={ci} transform={`translate(${positionLeft(ci)}, 0)`} onMouseDown={()=>startColumnSelect(ci)} onMouseMove={()=>changeColumnSelect(ci)} onMouseUp={endColumnSelect}>
          <CellHeader ci={ci}
                      headerObj={headerObj}
                      widthAt={widthAt}
                      headerResizeAt={headerResizeAt}
                      headerResizeStart={headerResizeStart}
                      col={col} />
      </g>)
    })

    return(
        <svg width={positionLeft(data.length + 1) + 1} height={24}>
          {header}
        </svg>
    )
  }
}

export default SpreadsheetHeader;