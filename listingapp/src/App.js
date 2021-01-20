import './App.css';
import React from 'react';
import ReactDOM from 'react-dom';
//import axios
import axios from 'axios';

import Container from 'react-bootstrap/Container'
import Button from 'react-bootstrap/Button'

class App extends React.Component{
  
  constructor(props){
    super(props);
    this.state = {
      currCategory: "gloves",
      beanies: null,
      facemasks: null,
      gloves: null,

    }
    
  }

fetchCategories = () =>{
  let categories = ["gloves", "facemasks", "beanies"]
  let config = {
    headers: {'Access-Control-Allow-Origin': "*"}
  }
  categories.forEach(async (category) => {  
    await axios.get('/v2/products/' + category, config)
    .then(res=>{
      switch(category){
        case "beanies":
          if(this.state.beanies == null){
            this.setState({
              beanies: res.data
            })
          }
          console.log(this.state.beanies)
          return;
        case "gloves":
          if(this.state.gloves == null){
            this.setState({
              gloves: res.data
            })
          }
          console.log(this.state.gloves)
          return;
        case "facemasks":
          if(this.state.facemasks == null){
            this.setState({
              facemasks: res.data
            })
          }
          console.log(this.state.facemasks)
          return;
        default:
          return
      }
      
    })
    .catch(error => {
      console.log(error.response.status, error.message)
    })
    
  });
}

changeCategory = (category) => {
  this.setState({
    currCategory: category.target.id
  })
}

getCategoryInfo = () =>{
  let categoryTable = [];
  switch(this.state.currCategory){
    case "beanies":
      this.state.beanies.map((value, index) =>{
        categoryTable.push(
        <tr id={index}>
          <td key="id">{value.id}</td>
          <td key="name">{value.name}</td>
          <td key="color">{value.color}</td>
          <td key="price">{value.price}</td>
          <td key="manufacturer">{value.manufacturer}</td>
        </tr>
        )
      })
      return categoryTable;
    case "gloves":
      this.state.gloves.map((value, index) =>{
        categoryTable.push(
        <tr id={index}>
          <td key="id">{value.id}</td>
          <td key="name">{value.name}</td>
          <td key="color">{value.color}</td>
          <td key="price">{value.price}</td>
          <td key="manufacturer">{value.manufacturer}</td>
        </tr>
        )
      })
      return categoryTable;
    case "facemasks":
      this.state.facemasks.map((value, index) =>{
        categoryTable.push(
        <tr id={index}>
          <td key="id">{value.id}</td>
          <td key="name">{value.name}</td>
          <td key="color">{value.color}</td>
          <td key="price">{value.price}</td>
          <td key="manufacturer">{value.manufacturer}</td>
        </tr>
        )
      })
      return categoryTable;
    default:
      return categoryTable
  }
 
}

componentDidMount = () => {
  this.fetchCategories()
}

  render(){
    let category=<tr><th>No data yet</th></tr>;
    if(this.state.gloves && this.state.beanies && this.state.facemasks){
      category = this.getCategoryInfo()
    }
    return(
      <Container>
        <div className="row">
          <div className="buttons">
            <Button id="beanies" onClick={this.changeCategory}>Beanies</Button>
            <Button id="facemasks" onClick={this.changeCategory}>Facemasks</Button>
            <Button id="gloves" onClick={this.changeCategory}>Gloves</Button>
            <p>{this.state.currCategory}</p>
          </div>
          <div className="table">
            <table>
              <tr>
                <th>ID</th>
                <th>{this.state.currCategory} name</th>
                <th>Color</th>
                <th>Price</th>
                <th>Manufacturer</th>
              </tr>
              {category}
            </table>
            
          </div>
        </div>
      </Container>
        
      
    )
  }
}



// function App() {
//   return (
//     <div className="App">
//       <header className="App-header">
//         <img src={logo} className="App-logo" alt="logo" />
//         <p>
//           Edit <code>src/App.js</code> and save <code>&lt;code&gt;</code>to  reload.
//         </p>
//         <a
//           className="App-link"
//           href="https://reactjs.org"
//           target="_blank"
//           rel="noopener noreferrer"
//         >
//           Learn React
//         </a>
//       </header>
//     </div>
//   );
// }

export default App;
