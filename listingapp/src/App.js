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
      currCategory: "gloves",
      beanies: null,
      facemasks: null,
      gloves: null,
      
    }
    this.stockRegex = /<INSTOCKVALUE>(.*)<\/INSTOCKVALUE>/
    this.manufacturerAV = []
    
  }

// fetchAvailability = async (manufacturer) =>{
//   let config = {
//     headers: {
//       'Access-Control-Allow-Origin': "*"
//     }
//   }
  
//   let returnAV
//   let axiosPass = true;
//   //check if manufacturer is already fetched before
//   this.manufacturerAV.every(manufac =>{
//     if(manufac.manufacturer === manufacturer){     
//       returnAV = manufac.data
//       axiosPass = false;
//       return false;
//     }
//     return true;
//   })
  
//   //console.log(manufacturer)
//   if(axiosPass){
//     await axios.get('/v2/availability/'+ manufacturer, config)
//     .then(res => {
//       if(res.status === 200){
//         this.manufacturerAV.push({"manufacturer": manufacturer, "data": res.data.response})
//         returnAV = res.data.response
//       }
//     }).catch(error =>{
//       return console.log(error)
//     })
//   }
//   return returnAV
// }


fetchCategories = () =>{
  let categories = ["gloves", "beanies", "facemasks"]
  let config = {
    headers: {
      'Access-Control-Allow-Origin': "*"
    }
  }
  categories.forEach(category => {  
    axios.get('/v2/products/' + category, config)
    .then(res=>{
      switch(category){
        case "beanies":
          if(this.state.beanies == null){
            this.setState({
              beanies: res.data
            })
          }
          
          return;
        case "gloves":
          // let glovesCtgry = res.data;
          
          // glovesCtgry.forEach((gloves, index) =>{
          //   let productAvblty = this.fetchAvailability(gloves.manufacturer)
          //   console.log(productAvblty)
          //   productAvblty.forEach(element => {
          //     if(gloves.id === element.id){
          //       glovesCtgry[index]["stockvalue"] = element.DATAPAYLOAD.match(this.stockRegex[1])
          //     }
          //   });
            
          // })
          if(this.state.gloves == null){
            this.setState({
              gloves: res.data
            })
          }
          return;
        case "facemasks":
          if(this.state.facemasks == null){
            this.setState({
              facemasks: res.data
            })
          }
         
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

getCategoryInfo = () =>{
  let categoryTable = [];
  switch(this.state.currCategory){
    case "beanies":
      this.state.beanies.map((value, index) =>{
        categoryTable.push(
        <tr id={index}>
          <td key="id">{value.id}</td>
          <td key="name">{value.name}</td>
          <td key="color">{value.color.join(", ")}</td>
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
          <td key="color">{value.color.join(", ")}</td>
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
          <td key="color">{value.color.join(", ")}</td>
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
    let category=<h6>Data is being fetched. Wait few seconds or press one of the category buttons on the top.</h6>;
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
          </div>
          <div className="table">
          <Table striped bordered hover>
              <tr>
                <th>ID</th>
                <th>{this.state.currCategory.charAt(0).toUpperCase() + this.state.currCategory.slice(1)} name</th>
                <th>Color(s)</th>
                <th>Price €</th>
                <th>Manufacturer</th>
              </tr>
              {category}
          </Table>
            
          </div>
        </div>
      </Container>
        
      
    )
  }
}

export default App;
