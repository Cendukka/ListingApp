/**
 * Author: Samuli Lehtonen
 * Date:27.02.2021
 * Summary: Listing app. Uses Axios to fetch categories and their data from api and listing them unsorted.
 */
import './App.css';
import React from 'react';
//import axios
import axios from 'axios';
import TableData from './tabledata'
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Button from 'react-bootstrap/Button'
import _ from 'lodash'

class App extends React.Component{
  
  constructor(props){
    super(props);
    this.state = {
      currCategory: null,                                         // Name of the selected category
      beanies: null,                                              //Beanies category
      facemasks: null,                                            //Facemasks category
      gloves: null,                                               //Gloves category
      fetchAVErrorMsg: null,                                      //Error message for availability fetching
      fetchCGErrorMsg: "Data is being fetched. Wait a moment..."  //Error message for category fetching
      
    }
    this.stockRegex = /<INSTOCKVALUE>(.*)<\/INSTOCKVALUE>/        //Regex to pick availavility from response
    this.manufacturerAV= []                                       //To hold fetched manufacturers' availability
    this.error = false;                                           //Error token
  }

  //fetch categories and save them in the state
  fetchCategories = () =>{
    let categories = ["gloves", "facemasks", "beanies"]
    let config = {
      headers: {
        'Access-Control-Allow-Origin': "*"    //Pass CORS policy
      }
    }
    categories.forEach((category) => {  
       axios.get('/v2/products/' + category, config)
      .then(res=>{
        switch(category){
          case "beanies":
            this.setState({
              currCategory: "beanies",
              beanies: res.data
            });
            return;
          case "gloves":
              this.setState({
              gloves: res.data
            });
            return;
          case "facemasks":
            this.setState({
              facemasks: res.data
            });
            return;
          default:
            return
        }
      })
      .catch(error => {
        this.setState({
          fetchCGErrorMsg: "Server was unavailable"
        })
        console.log(error.status, error.message)
      })
      
    });
  }
  //Fetch the availability information from the API afte button is clicked
  fetchAvailability =  (manufacturer, productID, event) =>{
    let config = {
      headers: {
        'Access-Control-Allow-Origin': "*"  //for passing CORS policy
      }
    }
    
    this.setState({
      fetchAVErrorMsg: ""
    })

    let axiosPass = true; //Token for axios.get

    // check if manufacturer is already fetched before
    this.manufacturerAV.every(manufac =>{
      if(manufac.manufacturer === manufacturer){
        axiosPass = false;
        this.addAvailability(manufacturer, productID)
        return false;
      }
      return true;
    })

    let clickedButton = document.getElementById(event.target.id)
    if(axiosPass && !clickedButton.classList.contains("processing")){ //Check if axiosPass is true and the clicked button isn't already processing get request
      this.addProcessing("button", manufacturer)
      axios.get('/v2/availability/'+ manufacturer, config)
      .then(res => {
        let categoryButtons = document.querySelectorAll("button")
        _.forEach(categoryButtons, button =>{
          if(button.classList.contains("categoryButton")){button.disabled = false}
        })
        if(res.status === 200){
          if(res.data.response.length && typeof res.data.response != "string"){
            this.manufacturerAV.push({"manufacturer": manufacturer, "data": res.data.response}) //save the response as an object to array
            this.removeProcessing("button", manufacturer)
          
          }else{ 
            this.removeProcessing("button", manufacturer)
            this.setState({
              fetchAVErrorMsg: "Fetching received nothing. Try again." //if received nothing, show error message
            })
            this.error = true
          }
        }else if(res.status === 404){
          this.removeProcessing("button", manufacturer)
          this.setState({
            fetchAVErrorMsg: "Availability of the manufacturer's product wasn't found. Try again."
          })
          this.error = true
        }else if(res.status === 503){
          this.removeProcessing("button", manufacturer)
          this.setState({
            fetchAVErrorMsg: "Server was unavailable. Try again."
          })
          this.error = true
        }
      }).then(()=> !this.error && this.addAvailability(manufacturer, productID))
      .catch(error =>{
        this.removeProcessing("button", manufacturer)
        this.setState({
          fetchAVErrorMsg: "Server was unavailable. Try again."
        })
        return console.log(error)
      })
    }
    return
  }

  //Function for finding the correct availability for selected product
  //
  //params: 
  //  manufacturer == (string) selected manufacturer's name
  addAvailability =  (manufacturer) =>{
    let manufacturerAV = this.manufacturerAV
    switch(this.state.currCategory){
      case "beanies":
        let beanies = this.state.beanies
        _.forEach(beanies,(beanie, index)=>{    //Map through beanies category 
          _.forEach(manufacturerAV,AV=>{ //if the correct beanie's id match the wanted productID map through manufacturers
            AV.manufacturer === manufacturer && _.forEach(AV.data, avData =>{ //when wanted manufacturer is founf map through the availability data of the manufacturer
              if(beanie.id === avData.id.toLowerCase()){
                beanies[index].availability = avData.DATAPAYLOAD.match(this.stockRegex)[1]
              }
            })
          })
        })
        this.setState({
          beanies: beanies
        })
        return
      case "facemasks":
        let facemasks = this.state.facemasks
        _.forEach(facemasks,(facemask, index)=>{    //Map through beanies category 
          _.forEach(manufacturerAV,AV=>{ //if the correct beanie's id match the wanted productID map through manufacturers
            AV.manufacturer === manufacturer && _.forEach(AV.data, avData =>{ //when wanted manufacturer is founf map through the availability data of the manufacturer
              if(facemask.id === avData.id.toLowerCase()){
                facemasks[index].availability = avData.DATAPAYLOAD.match(this.stockRegex)[1]
              }
            })
          })
        })
        this.setState({
          facemasks: facemasks
        })
        return 
      case "gloves":
        let gloves = this.state.gloves
        _.forEach(gloves,(glove, index)=>{    //Map through beanies category 
          _.forEach(manufacturerAV,AV=>{ //if the correct beanie's id match the wanted productID map through manufacturers
            AV.manufacturer === manufacturer && _.forEach(AV.data, avData =>{ //when wanted manufacturer is founf map through the availability data of the manufacturer
              if(glove.id === avData.id.toLowerCase()){
                gloves[index].availability = avData.DATAPAYLOAD.match(this.stockRegex)[1]
              }
            })
          })
        })
        this.setState({
          gloves: gloves
        })
        return 
      default:
        return <p>No current caregory selected. Try pressing the button or reload the window</p>
    }
    
  }

  /*Utility functions*/

  //to change current category
  changeCategory = (category) => {
    this.setState({
      currCategory: category.target.value
    })
  }
  //getter: Get wanted category
  getCategory = (category) =>{
    switch(category){
      case "beanies":
        return this.state.beanies;
      case "facemasks":
        return this.state.facemasks
      case "gloves":
        return this.state.gloves
      default:
        return null
    }
  }
  //Add processing class to an element and disable categorybuttons
  addProcessing = (elementName, manufacturer)=>{
    let clickedManufacButton = document.querySelectorAll(elementName)
        _.forEach(clickedManufacButton, button =>{
          if(button.classList.contains(manufacturer)){button.classList.add("processing")}
          if(button.classList.contains("categoryButton")){button.disabled = true}
        })
  }
    //Remove processing class from an element and enable categorybuttons
  removeProcessing = (elementName, manufacturer)=>{
    let clickedManufacButton = document.querySelectorAll(elementName)
        _.forEach(clickedManufacButton, button =>{
          if(button.classList.contains(manufacturer)){button.classList.remove("processing")}
          if(button.classList.contains("categoryButton")){button.disabled = false}
        })
  }

  componentDidMount = () => {
    this.fetchCategories()
  }
  render(){
    return(
      <Container>
        <Row className="buttons">
          <Col>
            <Button className="categoryButton" value="beanies" id="getBeaniesButton" onClick={this.changeCategory}>Beanies</Button>
            <Button className="categoryButton" value="facemasks" id="getFacemasksButton" onClick={this.changeCategory}>Facemasks</Button>
            <Button className="categoryButton" value="gloves" id="getGlovesButton" onClick={this.changeCategory}>Gloves</Button>
            {
              this.state.fetchAVErrorMsg && <span id="avErrorSpan">{this.state.fetchAVErrorMsg}</span>  //Show error message if Availability fetching failed somehow
            }      
          </Col>
        </Row>
        <Row className="table">
          <Col>
            {this.state.currCategory == null ? //show error message of category fetching or the table of the categories
            <h3 id="cgErrorH3">{this.state.fetchCGErrorMsg}</h3>
            :
            <TableData
              tableHeaders={["ID", "Name of "+this.state.currCategory, "Color(s)", "Price €", "Manufacturer", "Availability"]}
              categoryData={this.getCategory(this.state.currCategory)} 
              fetchAvailability={this.fetchAvailability}
              />
            }
          </Col>
        </Row>
      </Container>
        
      
    )
  }
}

export default App;
