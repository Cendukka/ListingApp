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
      currCategory: null,                                         //Name of the selected category
      beanies: null,                                              //Beanies category
      facemasks: null,                                            //Facemasks category
      gloves: null,                                               //Gloves category
      fetchAVErrorMsg: null,                                      //Error message for availability fetching
      fetchCGErrorMsg: "Data is being fetched. Wait a moment..."  //Error message for category fetching
      
    }
    this.stockRegex = /<INSTOCKVALUE>(.*)<\/INSTOCKVALUE>/        //Regex to pick availavility from response
    this.manufacturerAV= []                                       //To hold fetched manufacturers' availability
    this.avErrorToken = false;                                           //Error token
    this.categories = ["gloves", "facemasks", "beanies"]          //Categories to be fetched
    
  }

  //1.fetch categories and save them in the state
  fetchCategories = () =>{
    let categories = this.categories
    
    let config = {
      headers: {
        'Access-Control-Allow-Origin': "*",    //Pass CORS policy
      }
    }
    categories.forEach((category) => {  
       axios.get('/v2/products/' + category, config)
      .then(res=>{
        if(res.status === 200){
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
        }
        else{
          this.setState({
            fetchCGErrorMsg: "Server responsed with nothing. Try again by refreshing the page."
          })
        }
      })
      .catch(error => {
        this.setState({
          fetchCGErrorMsg: "The requested server was unavailable. Try again by refreshing the page."
        })
      })
      
    });
  }
  //2.Fetch the availability information from the API afte button is clicked
  //Params: 
  //  manufacturer == (string) selected manufacturer's name
  //  event == (object) event object, in this case 'click'-event
  fetchAvailability =  (manufacturer, event) =>{
    let config = {
      headers: {
        'Access-Control-Allow-Origin': "*",  //for passing CORS policy
      }
    }
    //reset errormsg
    this.setState({
      fetchAVErrorMsg: ""
    })
    
    let axiosPass = true; //Token for axios.get
    this.avErrorToken = false; //Reset error token
    let clickedButton = document.getElementById(event.target.id) //Clicked fetching button

    // check if manufacturer is already fetched before
    // Only necessary check if fetching was succesfull but rerendering wasn't and fetching is tried again
    this.manufacturerAV.every(manufac =>{
      if(manufac.manufacturer === manufacturer){
        axiosPass = false;
        this.addAvailability(manufacturer)
        return false;
      }
      return true;
    })

    
    if(axiosPass && !clickedButton.classList.contains("processing")){ //Check if axiosPass is true and the clicked button isn't already processing get request
      this.addProcessing("button", manufacturer)
      axios.get('/v2/availability/'+ manufacturer, config)
      .then(res => {

        //Remove disabled from category buttons and fetching buttons
        let categoryButtons = document.querySelectorAll("button")
        _.forEach(categoryButtons, button =>{
          if(button.classList.contains("categoryButton")){button.disabled = false}
        })
        this.removeProcessing("button", manufacturer)

        if(res.status === 200){
          if(Array.isArray(res.data.response)){
            this.manufacturerAV.push({"manufacturer": manufacturer, "data": res.data.response}) //save the response as an object to array        
          }else{ 
            this.setState({
              fetchAVErrorMsg: "Fetching received nothing. Try again." //if received nothing, show error message
            })
            this.avErrorToken = true
          }
        }else if(res.status === 404){
          this.setState({
            fetchAVErrorMsg: "Availability of the manufacturer's product wasn't found. Try again."
          })
          this.avErrorToken = true
        }else if(res.status === 503){
          this.setState({
            fetchAVErrorMsg: "Server was unavailable. Try again."
          })
          this.avErrorToken = true
        }
      }).then(()=> !this.avErrorToken && this.addAvailability(manufacturer))
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

  setAvailability = (category,manufacturer) =>{
    let manufacturerAV = this.manufacturerAV
    let tempCategory = category
    _.forEach(tempCategory,(product, index)=>{ //Map through category and availability data
      
      _.forEach(manufacturerAV,AV=>{
        AV.manufacturer === manufacturer && _.forEach(AV.data, avData =>{ //when wanted manufacturer is founf map through the availability data of the manufacturer
          if(product.id === avData.id.toLowerCase()){
            
            tempCategory[index].availability = avData.DATAPAYLOAD.match(this.stockRegex)[1]
          }
        })
      })
    })
    return tempCategory
  }

  //3.Function for finding the correct availability for selected product
  //
  //params: 
  //  manufacturer == (string) selected manufacturer's name
  addAvailability =  (manufacturer) =>{
    // let manufacturerAV = this.manufacturerAV
    switch(this.state.currCategory){
      case "beanies":
        let beanies = this.setAvailability(this.state.beanies,manufacturer)
        this.setState({
          beanies: beanies
        })
        return
      case "facemasks":
        let facemasks = this.setAvailability(this.state.facemasks,manufacturer)
        this.setState({
          facemasks: facemasks
        })
        return 
      case "gloves":
        let gloves = this.setAvailability(this.state.gloves,manufacturer)
        this.setState({
          gloves: gloves
        })
        return 
      default:
        return <p>No current caregory selected. Try pressing the button or reload the window</p>
    }
  }

  /*Utility functions*/

  //Set current category
  setCategory = (category) => {
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
  //Add processing class to an element and disable categorybuttons and selected manufacturer's availability fetching buttons
  addProcessing = (elementName, manufacturer)=>{
    let clickedManufacButton = document.querySelectorAll(elementName)
        _.forEach(clickedManufacButton, button =>{
          if(button.classList.contains(manufacturer)){
            button.classList.add("processing"); 
            button.disabled = true;
          }
          if(button.classList.contains("categoryButton")){button.disabled = true}
        })
  }
    //Remove processing class from an element and enable categorybuttons and selected manufacturer's availability fetching buttons
  removeProcessing = (elementName, manufacturer)=>{
    let clickedManufacButton = document.querySelectorAll(elementName)
        _.forEach(clickedManufacButton, button =>{
          if(button.classList.contains(manufacturer)){button.classList.remove("processing");button.disabled = false }
          if(button.classList.contains("categoryButton")){button.disabled = false}
        })
  }
/*End of utility functions*/

  componentDidMount = () => {
    this.fetchCategories()
  }
  render(){
    return(
      <Container>
        <Container className="C-B-Container">
          <h3>Select a category</h3>
          <Row className="categoryButtons">
            <Col>
              <Button className="categoryButton" value="beanies" id="getBeaniesButton" onClick={this.setCategory}>Beanies</Button>
              <Button className="categoryButton" value="facemasks" id="getFacemasksButton" onClick={this.setCategory}>Facemasks</Button>
              <Button className="categoryButton" value="gloves" id="getGlovesButton" onClick={this.setCategory}>Gloves</Button>
              {
                this.state.fetchAVErrorMsg && <span id="avErrorSpan">{this.state.fetchAVErrorMsg}</span>  //Show error message if Availability fetching failed somehow
              }      
            </Col>
          </Row>
        </Container>
        <Row className="table">
          <Col>
            {this.state.currCategory == null ? //show error message of category fetching or the table of the categories
            <h3 id="cgErrorH3">{this.state.fetchCGErrorMsg}</h3>
            :
            <TableData 
              tableHeaders={["ID", "Name of "+this.state.currCategory, "Color(s)", "Price €", "Manufacturer", "Availability"]} //table headers
              categoryData={this.getCategory(this.state.currCategory)} //category data
              fetchAvailability={this.fetchAvailability} //passed function for buttons to fetch availability
              />
            }
          </Col>
        </Row>
      </Container>
        
      
    )
  }
}

export default App;
