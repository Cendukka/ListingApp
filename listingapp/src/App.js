import './App.css';
import React from 'react';
import ReactDOM from 'react-dom';
//import axios
import axios from 'axios';

import Container from 'react-bootstrap/Container'
import Button from 'react-bootstrap/Button'
import Table from 'react-bootstrap/Table'

class App extends React.Component{
  
  constructor(props){
    super(props);
    this.state = {
      currCategory: null,
      beanies: null,
      facemasks: null,
      gloves: null
      
    }
    this.stockRegex = /<INSTOCKVALUE>(.*)<\/INSTOCKVALUE>/
    this.manufacturerAV = []
    
    
  }

getCategory = () =>{
  switch(this.state.currCategory){
    case "beanies":
      return this.state.beanies;
    case "facemasks":
      return this.state.facemasks
    case "gloves":
      return this.state.gloves
    default:
      return <p>No current caregory selected. Try pressing the button or reload the window</p>
  }
}

fetchAvailability = (manufacturer) =>{
  // let config = {
  //   headers: {
  //     'Access-Control-Allow-Origin': "*"
  //   }
  // }
  console.log(manufacturer)
  // let returnAV
  // let axiosPass = true;
  //check if manufacturer is already fetched before
  // this.manufacturerAV.every(manufac =>{
  //   if(manufac.manufacturer === manufacturer){     
  //     returnAV = manufac.data
  //     axiosPass = false;
  //     return false;
  //   }
  //   return true;
  // })
  
  // //console.log(manufacturer)
  // if(axiosPass){
  //   await axios.get('/v2/availability/'+ manufacturer, config)
  //   .then(res => {
  //     if(res.status === 200){
  //       this.manufacturerAV.push({"manufacturer": manufacturer, "data": res.data.response})
  //       returnAV = res.data.response
  //     }
  //   }).catch(error =>{
  //     return console.log(error)
  //   })
  // }
  // return returnAV
}


fetchCategories = () =>{
  let categories = ["gloves", "facemasks", "beanies"]
  let config = {
    headers: {
      'Access-Control-Allow-Origin': "*"
    }
  }
  categories.forEach(category => {  
    axios.get('/v2/products/' + category, config)
    .then(res=>{

      let categoryTable = [];

      switch(category){
        case "beanies":
          res.data.map((value, index) =>{
            categoryTable.push(
            <tr id={index}>
              <td key="beanieId">{value.id}</td>
              <td key="beanieName">{value.name}</td>
              <td key="beanieColor">{value.color.join(", ")}</td>
              <td key="beaniePrice">{value.price}</td>
              <td key="beanieManufacturer"><a href="#" onClick={this.fetchAvailability}>{value.manufacturer}</a></td>
            </tr>
            )
          })
          this.setState({
            currCategory: "beanies",
            beanies: categoryTable
          });
          return;
        case "gloves":
          res.data.map((value, index) =>{
            categoryTable.push(
            <tr id={index}>
              <td key="gloveId">{value.id}</td>
              <td key="gloveName">{value.name}</td>
              <td key="gloveColor">{value.color.join(", ")}</td>
              <td key="glovePrice">{value.price}</td>
              <td key="gloveManufacturer"><a href="#" onClick={this.fetchAvailability}>{value.manufacturer}</a></td>
            </tr>
            )
          })
          this.setState({
            gloves: categoryTable
          });
          return;
        case "facemasks":
          res.data.map((value, index) =>{
            categoryTable.push(
            <tr id={index}>
              <td key="facemaskId">{value.id}</td>
              <td key="facemaskName">{value.name}</td>
              <td key="facemaskColor">{value.color.join(", ")}</td>
              <td key="facemaskPrice">{value.price}</td>
              <td key="facemaskManufacturer"><a href="#" onClick={this.fetchAvailability}>{value.manufacturer}</a></td>
            </tr>
            )
          })
          this.setState({
            facemasks: categoryTable
          });
          return;
        default:
          return
      }
      
    })
    .catch(error => {
      console.log(error.status, error.message)
    })
    
  });
}

changeCategory = (category) => {
  this.setState({
    currCategory: category.target.id
  })
  
}

// getCategoryInfo = () =>{
//   let categoryTable = [];
//   switch(this.state.currCategory){
//     case "beanies":
//       this.state.beanies.map((value, index) =>{
//         categoryTable.push(
//         <tr id={index}>
//           <td key="beanieId">{value.id}</td>
//           <td key="beanieName">{value.name}</td>
//           <td key="beanieColor">{value.color.join(", ")}</td>
//           <td key="beaniePrice">{value.price}</td>
//           <td key="beanieManufacturer"><a href="#" onClick={this.fetchAvailability}>{value.manufacturer}</a></td>
//         </tr>
//         )
//       })
//       return categoryTable;
//     case "gloves":
//       this.state.gloves.map((value, index) =>{
//         categoryTable.push(
//         <tr id={index}>
//           <td key="gloveId">{value.id}</td>
//           <td key="gloveName">{value.name}</td>
//           <td key="gloveColor">{value.color.join(", ")}</td>
//           <td key="glovePrice">{value.price}</td>
//           <td key="gloveManufacturer"><a href="#" onClick={this.fetchAvailability}>{value.manufacturer}</a></td>
//         </tr>
//         )
//       })
//       return categoryTable;
//     case "facemasks":
//       this.state.facemasks.map((value, index) =>{
//         categoryTable.push(
//         <tr id={index}>
//           <td key="facemaskId">{value.id}</td>
//           <td key="facemaskName">{value.name}</td>
//           <td key="facemaskColor">{value.color.join(", ")}</td>
//           <td key="facemaskPrice">{value.price}</td>
//           <td key="facemaskManufacturer"><a href="#" onClick={this.fetchAvailability}>{value.manufacturer}</a></td>
//         </tr>
//         )
//       })
//       return categoryTable;
//     default:
//       return categoryTable
//   }
 
// }

componentDidMount = () => {
  this.fetchCategories()
}

  render(){
    return(
      <Container>
        <div className="row">
          <div className="buttons">
            <Button class="button" id="beanies" onClick={this.changeCategory}>Beanies</Button>
            <Button class="button" id="facemasks" onClick={this.changeCategory}>Facemasks</Button>
            <Button class="button" id="gloves" onClick={this.changeCategory}>Gloves</Button>
          </div>
          <div className="table">
            <Table striped bordered hover>
                <tr>
                  <th>ID</th>
                  <th>Name of {this.state.currCategory}</th>
                  <th>Color(s)</th>
                  <th>Price €</th>
                  <th>Manufacturer</th>
                </tr>
                {this.state.currCategory == null ? <tr><th>Data Is being fetched. Wait a moment</th></tr> : this.getCategory()}
                
            </Table>
          </div>
        </div>
      </Container>
        
      
    )
  }
}

export default App;
