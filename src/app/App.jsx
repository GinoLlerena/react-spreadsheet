import React, {Component} from 'react'
import SpreadsheetContainer from './components/SpreadsheetContainer.jsx'
import reduce from 'lodash/reduce'

const DataContext = React.createContext({
  data: [],
  headerObj: [],
  onChangeData: ()=>{},
  onChangeHeader: ()=>{}
});


const  demoBasic = {
  header: [
    { name: "Name", width: 200 },
    { name: "Age", width: 60 },
    { name: "Gender", width: 60 }
  ],
  data: [
    ["Yamada Taro", "12", "M"],
    ["Yamada Hanako", "12", "M"],
    ["Sato Jiro", "12", "M"],
    ["Sato Hanako", "12", "M"]
  ]
};

function dataToState(data) {
  return reduce(data, (acc, row, ri)=>{
    acc[ri] = reduce(row, (obj, col,ci)=>{
      obj[ci] = col;
      return obj;
    }, {})
    return acc;
  }, {})
}

function headerToObj({header, data}) {
  return header
      ? header
      : data[0].map((item, idx) => {
    return {
      name: String.fromCharCode(65 + idx),
      width: 80
    };
  });
}

console.log(dataToState(demoBasic.data));

class DataProvider extends Component {


  constructor(props) {
    super(props);

    this.onChangeData = (c, r, value) =>{
      const data = this.state.data;
      const newData = data.map((row, ri) =>{
        if(ri === r){
          row = row.map((col, ci) => {
            if(ci === c){
              col = value;
            }
            return col;
          })
        }
        return row;
      })
      this.setState({data:newData});
    }

    this.onChangeHeader = (headerResizeAt, width)=>{
      const headerObj = this.state.headerObj.map((item,i) => {
        if(i === headerResizeAt) {
          item.width = width;
        }
        return item;
      })
      this.setState({headerObj});
    }


    this.state = {
      data: demoBasic.data,
      headerObj: headerToObj(demoBasic),
      onChangeData : this.onChangeData,
      onChangeHeader: this.onChangeHeader
    }

  }

  render() {
    return (
        <DataContext.Provider value={this.state}>
          {this.props.children}
        </DataContext.Provider>
    )
  }
}

class App extends Component {
  render() {
    return (
        <DataProvider>
          <DataContext.Consumer>
            {({data, headerObj, onChangeData, onChangeHeader}) => (
                <SpreadsheetContainer data={data} headerObj={headerObj} onChangeData={onChangeData} onChangeHeader={onChangeHeader} />
            )}
          </DataContext.Consumer>
        </DataProvider>
    )
  }
}

export default App;