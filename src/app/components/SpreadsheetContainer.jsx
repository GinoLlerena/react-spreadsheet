import React, {Component} from 'react'
import SpreadsheetBody from './SpreadsheetBody.jsx'
import SpreadsheetHeader from './SpreadsheetHeader.jsx'

const Style = {
  height: 400,
  overflow: 'scroll',
  position: 'relative'
}

class SpreadsheetContainer extends Component{

  constructor(props){
    super(props);
    this.state = {
      selection:{ c: 0, r: 0, sc: 0, sr: 0}
    }
  }

  componentDidMount() {
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
  }

  componentWillUnmount() {
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
  }

  editorStyleObj =()=> {
    const {selection} = this.state;
    return {
      left: this.positionLeft(selection.c),
      top: selection.r * 24,
      width: this.selectionSize().w
    };
  }

  selectionCount = () => {
    const {selection} = this.state;
    return {
      r: (selection.r <= selection.sr) ? selection.r : selection.sr,
      c: (selection.c <= selection.sc) ? selection.c : selection.sc,
      w: Math.abs(selection.sc - selection.c) + 1,
      h: Math.abs(selection.sr - selection.r) + 1
    };
  }

  selectionSize =() => {
    const selectionCount = this.selectionCount();
    return {
      r: this.positionLeft(selectionCount.r),
      c: this.positionLeft(selectionCount.c),
      w: this.positionLeft(selectionCount.c + selectionCount.w) - this.positionLeft(selectionCount.c),
      h: this.positionLeft(selectionCount.c + selectionCount.h) - this.positionLeft(selectionCount.c)
    };
  }

  onMouseUpSvg = () =>{
    this.endSelection();
    this.headerResizeEnd();
  }

  endSelection = () => {
    this.setState({selectionMode:false})
  }

  headerResizeStart =(c) => {
    this.setState({headerResizeAt:c});
  }

  headerResizeEnd= () =>{
    this.setState({headerResizeAt:-1})
  }

  headerResizeMove =(e)=> {
    const {headerResizeAt} = this.state;
    const {onChangeHeader} = this.props;
    var headerRect = e.target.parentNode.parentNode.getBoundingClientRect();
    var headerMouseX = e.clientX - headerRect.left;
    if (headerResizeAt >= 0) {
      const updateWidth = headerMouseX - this.positionLeft(headerResizeAt);
      const  width = updateWidth > 30 ? updateWidth : 30;
      onChangeHeader(headerResizeAt, width)
    }
  }

  widthAt = (index) => {
    const {headerObj} = this.props;
    try {
      return headerObj[index].width;
    }catch(e){
      console.log(index, headerObj, e);
    }
  }

  positionLeft =(index) =>{
    const {headerObj} = this.props;
    return headerObj
        .slice(0, index)
        .map(it => it.width)
        .reduce((a, b) => a + b, 0);
  }

  editCell = (c, r) => {
    this.setState({editing:true},()=> this.refs.hiddenInput.focus()) ;
  }

  editHere = () =>{
    const {selection} = this.state;
    this.editCell(selection.c, selection.r);
  }

  onMouseDownCell =(c, r) => {
    const {editing} = this.state;
    const selectionCount = this.selectionCount();
    if (editing) {
      this.onBlur();
    }
    if (
        selectionCount.c === c &&
        selectionCount.r === r &&
        selectionCount.w === 1 &&
        selectionCount.h === 1
    ) {
      this.editHere();
      return;
    }
    this.setSelectionStart(c, r);
    this.refs.hiddenInput.focus();
  }

  onMouseMoveCell = (c, r) => {
    const {selectionMode} = this.state;
    if (selectionMode) {
      this.setSelectionEnd(c, r);
    }
  }

  setSelectionEnd = (c, r) => {
    const {selectionMode, selection} = this.state;
    if (selectionMode) {
      this.setState({selection : {...selection, c, r}});

    }
  }

  setSelectionSingle = (c, r) => {
    const selection = {c, r, sc:c, sr: r};
    this.setState({selection})
  }

  setSelectionStart = (c, r) => {
    this.setSelectionSingle(c, r);
    this.setState({selectionMode : true});
  }

  getDataAt = (c, r) => {
    const {data} = this.props;
    return data[r][c];
  }

  onBlur = ()=> {
    this.setState({editing : false});
  }

  clearCell= (c, r)=> {
    const {onChangeData} = this.props;
    onChangeData(c, r, "");
    this.setState({editing : false});
  }

  clearSelection = () => {
    const selectionCount = this.selectionCount();
    for (let i = 0; i < selectionCount.h; i++) {
      for (let j = 0; j < selectionCount.w; j++) {
        this.clearCell(selectionCount.c + j, selectionCount.r + i);
      }
    }
  }

  startColumnSelect = (c) => {
    const selection = {sr: this.props.data.length - 1, r : 0, sc : c, c : c}
    const selectionModeColumn = true;
    this.setState({selection, selectionModeColumn})
  }

  changeColumnSelect = (c) => {
    const {selectionModeColumn} = this.state;
    if (selectionModeColumn) {
      const selection = {...this.state.selection, c};
      this.setState({selection})
    }
  }

  endColumnSelect =() =>{
    this.setState({ selectionModeColumn:false})
  }

  isInsideTable = (c, r) => {
    const {data} = this.props;
    if (c < 0) {
      return false;
    }
    if (r < 0) {
      return false;
    }
    if (c > data[0].length - 1) {
      return false;
    }
    if (r > data.length - 1) {
      return false;
    }
    return true;
  }

  fixScroll = () => {
    const {selection} = this.state;
    const el = this.refs["wrapper"];
    if (el.scrollTop > selection.r * 24) {
      el.scrollTop = selection.r * 24;
    }
    if (el.scrollTop < selection.r * 24 - el.clientHeight + 24) {
      el.scrollTop = selection.r * 24 - el.clientHeight + 24;
    }
    if (el.scrollLeft < this.positionLeft(selection.c) - el.clientWidth) {
      el.scrollLeft = this.positionLeft(selection.c);
    }
  }

  moveInputCaretToEnd() {
    var el = this.refs["hiddenInput"];
    //el.setSelectionRange(this.editingText.length, this.editingText.length);
  }


  moveCursor = (dc, dr) =>{
    const { selection, selectionMode, editing} = this.state;
    if (!this.isInsideTable(selection.c + dc, selection.r + dr)) {
      return;
    }
    if (selectionMode) {
      this.setSelectionEnd(selection.c + dc, selection.r + dr);
      this.fixScroll();
      return;
    }
    if (editing) {
      this.onBlur();
    }
    this.setSelectionSingle(selection.c + dc, selection.r + dr);
    this.fixScroll();
  }

  onKeyDown =(e) =>{
    const { selection, selectionMode, editing} = this.state;
    switch (e.keyCode) {
      case 8: //backspace
        if (!editing) {
          this.moveInputCaretToEnd();
          this.editHere();
        }
        break;
      case 37: //left
        this.moveCursor(-1, 0);
        e.preventDefault();
        break;
      case 38: //up
        this.moveCursor(0, -1);
        e.preventDefault();
        break;
      case 39: //right
        this.moveCursor(1, 0);
        e.preventDefault();
        break;
      case 40: //down
        this.moveCursor(0, 1);
        e.preventDefault();
        break;
      case 46: //delete
        this.clearSelection();
        break;
      case 13: //enter
        this.moveCursor(0, 1);
        break;
      case 16: //shift
        this.setSelectionStart(selection.c, selection.r);
        break;
      case 91: //ctrl
        break;
      case 113: //F2
        if (!editing) {
          this.moveInputCaretToEnd();
          this.editHere();
        }
        break;
      default:
        if (!editing) {
          //this.editingText = "";
          this.editHere();
        }
        break;
    }
  }

  onKeyUp = (e)=> {
    switch (e.keyCode) {
      case 16: //shift
        this.endSelection();
        break;
    }
  }

  render(){
    const {selection, headerResizeAt, editing } = this.state;
    const {data, headerObj, onChangeData} = this.props;
    return(
        <div className="grid"
             onMouseUp={()=>this.onMouseUpSvg()}
             onMouseMove={this.headerResizeMove}>
          <SpreadsheetHeader positionLeft={this.positionLeft}
                               startColumnSelect={this.startColumnSelect}
                               changeColumnSelect={this.changeColumnSelect}
                               endColumnSelect={this.endColumnSelect}
                               widthAt={this.widthAt}
                               headerObj={headerObj}
                               headerResizeAt={headerResizeAt}
                               headerResizeStart={this.headerResizeStart}
                               data={data} />
          <div ref="wrapper" style={Style}>
            <SpreadsheetBody
                positionLeft={this.positionLeft}
                data={data}
                widthAt={this.widthAt}
                selectionSize={this.selectionSize()}
                selectionCount={this.selectionCount()}
                onMouseDownCell={this.onMouseDownCell}
                onMouseMoveCell={this.onMouseMoveCell}
            />
            <div className="editor__frame" style={this.editorStyleObj()}>
              <input ref="hiddenInput"
                     value={this.getDataAt(selection.c, selection.r)}
                     onChange={(e)=> onChangeData(selection.c, selection.r, e.target.value)}
                     onMouseDown={()=>this.onMouseDownCell(selection.c, selection.r)}
                     className={"editor__textarea " + (editing ? 'editor--visible' : '')}
                     onBlur={this.onBlur}
                     autoFocus={true} />
            </div>
          </div>
        </div>
    )
  }
}

export default SpreadsheetContainer;