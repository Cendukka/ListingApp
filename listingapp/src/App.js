/**
 * Author: Samuli Lehtonen
 * Date:28.01.2021
 * Summary: Listing app. Uses Axios to fetch categories and their data from api and listing them unsorted.
 */
import './App.css';
import React from 'react';
//import axios
import axios from 'axios';
import TableData from './tabledata'
import Container from 'react-bootstrap/Container'
import Button from 'react-bootstrap/Button'

class App extends React.Component{
  
  constructor(props){
    super(props);
    this.state = {
      currCategory: null,                                         // Name of the selected category
      beanies: null,                                              //Beanies category
      facemasks: null,                                            //Facemasks category
      gloves: null,                                               //Gloves category
    }
    this.stockRegex = /<INSTOCKVALUE>(.*)<\/INSTOCKVALUE>/            //Regex to pick availavility from response
    this.manufacturerUrlRegex = /availability\/(.*)/
    this.fetchedManufacturers = []                                           //Array to hold manufacturers
    this.manufacturerAV= []                                           //To hold fetched manufacturers' availability
    this.error = false;                                               //Error token
    this.fetchAVErrorMsg = null                                       //Error message for availability fetching
    this.fetchCGErrorMsg = "Data is being fetched. Wait a moment..."  //Error message for category fetching
  }
  
  //getter: Get wanted category
  getCategory = (category) =>{
    console.log("getCategory")
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


  //Function for finding the correct availability for selected product
  addAvailability = async (productCategories, avDataArray) =>{
    let tempProductCategories = productCategories
    let tempAvDataArray = avDataArray
    let counter = 0; 
    // console.log(productCategories, avDataArray)
    await tempProductCategories.forEach((productCategory)=>{
      // console.log(productCategory.data)
      productCategory.data.forEach(product=>{
       //console.log(product)
        tempAvDataArray.every(AvData => {
          // console.log("Third foreach")
          AvData.every(AV =>{
            let AVID = AV.id.toLowerCase()
            let productID = product.id
            if(AVID === productID){
              product["availability"] = AV.DATAPAYLOAD.match(this.stockRegex)[1]
              return false
            }
            return true
          })
          return true
        })
      })
       ++counter
      console.log(counter)
       if(counter >= productCategories.length){
        tempProductCategories.forEach(productCategory=>{
          this.setCategory(productCategory.data[0].type, productCategory.data)
          this.setDisable("button", "categoryButton", false)
          this.setOrRemoveClass("button", "remove", "buttonLink")
          //console.log(productCategory.data)
        })
        
      }
    })
    
  }
  //Fetch the avaialability information from the API
  fetchAvailability = (manufacturersArray, tempCategories) =>{
    
    let config = {
      headers: {
        'Access-Control-Allow-Origin': "*"  //for passing CORS policy
      }
    }
    //Axios.get requests
    let axiosGet = []
    manufacturersArray.forEach((manufacturer) =>{
      axiosGet.push(axios.get('/v2/availability/'+ manufacturer, config))
    })

    this.fetchAVErrorMsg = null
    let avData = [], manufacturer;
    let manufacturersToFetchAgain = manufacturersArray
    
    axios.all(axiosGet)
    .then(resArrObj => { 
      resArrObj.forEach(res =>{
        if(res.status === 200){
          if(Array.isArray(res.data.response)){
          manufacturer = res.request.responseURL.match(this.manufacturerUrlRegex)[1]
          manufacturersToFetchAgain.splice(manufacturersToFetchAgain.indexOf(manufacturer), 1)
          this.manufacturerAV.push({"key":manufacturer, "data":  res.data.response})
          
          avData.push(res.data.response)
          }else{
            this.fetchAVErrorMsg += "Received no availability data from "+manufacturer+" manufacturer. "
          }
        }
        else if(res.status === 404){
          this.fetchAVErrorMsg = "Availability of the manufacturer's product wasn't found. Try again."
          this.error = true
        }
      })
    })
    .then(()=>{
      !this.error && this.addAvailability(tempCategories, avData)
    })
    .catch(error =>{
      
        this.fetchAVErrorMsg = "Server was unavailable. Try again."
        this.error = true
      return console.log(error)
    })
    
  }
  
//fetch categories and save them in the state
  fetchCategories = (categoryNameArray) =>{
    this.setDisable("button", "categoryButton", true)
    this.setOrRemoveClass("button", "add", "buttonLink")
    let config = {
      headers: {
        'Access-Control-Allow-Origin': "*" //for passing CORS policy
      }
    }
    let tempCategory;               //variable to hold data of the response
    let manufacToBeFetched = [];    //array to save manufacturers that needs to be fetched
    let tempCategories = [];        //array to save all fetched categories where availability information is added

    //axios.all get promises
    let axiosGet = []                                                 
    categoryNameArray.forEach((category) =>{
      axiosGet.push(axios.get('/v2/products/'+ category, config))
    })
    
    axios.all(axiosGet)
    .then(resArrObj => {
      resArrObj.forEach(resArr => {
        if (resArr.status === 200) {         
          tempCategory = resArr.data;                                             //1. Save the received data in temp variable
          let categoryType = resArr.data[0].type                                    
          tempCategories.push({"key": categoryType, "data": tempCategory})        //2. Save the received data in array for availability fetching
          tempCategory.forEach(product =>{                                        //4. Check the manufacturers
            if(!manufacToBeFetched.includes(product.manufacturer)){
              manufacToBeFetched.push(product.manufacturer)                       //5. Add manufacturer to fetching list
            }
          })
        this.setCategory(resArr.data[0].type,tempCategory);                       //6. Set categories in state
      }
    })
    }).then(()=>{
      this.fetchAvailability(manufacToBeFetched, tempCategories);                 //7. fetch manufacturers availability
    })
    .catch(error => {
      this.fetchCGErrorMsg = "Server was unavailable"
      console.log(error.status, error.message);
    });
    
  }
//to change current category
  changeCategory = (category) => {
    this.setState({
      currCategory: category.target.value
    })
    
  }
  setCategory = (categoryName, catData) => {
    console.log("setCategory")
    switch(categoryName){
      case "beanies":
        this.setState({
          currCategory: "beanies",
          beanies: catData
        })
        return
      case "facemasks":
        this.setState({
          currCategory: "facemasks",
          facemasks: catData
        })
        return 
      case "gloves":
        this.setState({
          currCategory: "gloves",
          gloves: catData
        })
        return 
      default:
        return 
    }
  }
  setDisable = (element, className, bool) =>{
    const elements = document.querySelectorAll(element)
    elements.forEach(ele=>{
      ele.className.includes(className) && (ele.disabled = bool)
    })
  }
  setOrRemoveClass = (element="", operation="", className="") => {
    const elements = document.querySelectorAll(element)
    
    switch(operation){
      case "add":
        elements.forEach(ele=>{
          console.log(ele)
          !ele.classList.contains(className) && (ele.classList.add(className))
        })
        return
      case "remove":
        elements.forEach(ele=>{
          ele.classList.contains(className) && (ele.classList.remove(className))
        })
      default:
        return
    }
    
  }
  componentDidMount = () => {
    this.fetchCategories(["beanies","gloves","facemasks"]); //fetch categories
  }

  
  render(){
    return(
      <Container>
        <div className="row">
          <div id="cacheWarningDiv" style={localStorage.getItem("isCacheAgreed") ? {"display":"none"} : {"display":"block"}}>
            <span className="cacheInfo">
              This website uses localstorage cache to save category and availability data. Press OK to agree that the page saves data to localstorage.
            </span>
            <Button className="button" onClick={() =>{
              document.getElementById('cacheWarningDiv').style.display = "none"
              localStorage.setItem("isCacheAgreed", true)
              }}>Ok
            </Button>
          </div>
          <div className="buttons">
            <Button className="button categoryButton" value="beanies" id="getBeaniesButton" onClick={this.changeCategory}>Beanies</Button>
            <Button className="button categoryButton" value="facemasks" id="getFacemasksButton" onClick={this.changeCategory}>Facemasks</Button>
            <Button className="button categoryButton" value="gloves" id="getGlovesButton" onClick={this.changeCategory}>Gloves</Button>
            <span id="avErrorSpan" style={this.error ? {"display": "block"} : {"display": "none"}}>{this.fetchAVErrorMsg}</span>
          </div>
          <div className="table">
          {this.state.currCategory == null ? //show error message of category fetching or the table of the categories
          <h3 id="cgErrorH3">{this.fetchCGErrorMsg}</h3>
          :
          <TableData
            tableHeaders={["ID", "Name of "+this.state.currCategory, "Color(s)", "Price €", "Manufacturer", "Availability"]}
            categoryData={this.getCategory(this.state.currCategory)}
            />
          }
          </div>
        </div>
      </Container>
        
      
    )
  }
}

export default App;
