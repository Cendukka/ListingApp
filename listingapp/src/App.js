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
    this.fetchedManufacturers = []                                           //Array to hold manufacturers
    this.manufacturerAV= []                                           //To hold fetched manufacturers' availability
    this.error = false;                                               //Error token
    this.fetchAVErrorMsg = null                                       //Error message for availability fetching
    this.fetchCGErrorMsg = "Data is being fetched. Wait a moment..."  //Error message for category fetching
  }
  
  //getter: Get wanted category
  getCategory = (category) =>{
    console.log(this.state.currCategory)
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
  addAvailability =  (category, avData) =>{
    
    let tempCategory = category
    tempCategory.forEach((product, pIndex)=>{
      avData && avData.every((data, avIndex)=>{
        if(product.id === data.id){
          tempCategory[pIndex].availability = data.DATAPAYLOAD.match(this.stockRegex)[1]
          return false
        }
        console.log(pIndex)
        return true
      })
    },()=>{
      console.log("menee")
        switch(category.type){
          case "beanies":
            this.setState({
              currCategory: "beanies",
              beanies: tempCategory
            })
            return
          case "facemasks":
            this.setState({
              currCategory: "facemasks",
              facemasks: tempCategory
            })
            return 
          case "gloves":
            this.setState({
              currCategory: "gloves",
              gloves: tempCategory
            })
            return 
          default:
            return <p>No current caregory selected. Try pressing the button or reload the window</p>
        }
    })
    
  }
  //Fetch the avaialability information from the API
  fetchAvailability = (manufacturersArray, tempCategory) =>{
    let config = {
      headers: {
        'Access-Control-Allow-Origin': "*"  //for passing CORS policy
      }
    }
    let axiosGet = []
    manufacturersArray.forEach((manufacturer) =>{
      axiosGet.push(axios.get('/v2/availability/'+ manufacturer, config))
    })

    this.fetchAVErrorMsg = null
    let avData;
    
    axios.all(axiosGet)
      .then(res => { 
        console.log(res)
        avData = res.data.response;
        // if(res.status === 200){
        //   if(res.data.response.length && typeof res.data.response != "string"){
        //     this.manufacturerAV.push({"manufacturer": manufacturer, "data": res.data.response}) //save the response as an object to array
        //   }else{ 
            
        //     this.fetchAVErrorMsg += "Fetching "+manufacturer+" received nothing. "  //if received nothing, show error message
        //     avData = null
            
        //   }
        //  }//else if(res.status === 404){
          
      //       this.fetchAVErrorMsg = "Availability of the manufacturer's product wasn't found. Try again."
          
      //     this.error = true
      //   }else if(res.status === 503){
          
      //       this.fetchAVErrorMsg = "Server was unavailable. Try again."
          
      //     this.error = true
      //   }
       })//.then(()=> !this.error && this.addAvailability(tempCategory, avData))
      .catch(error =>{
        
          this.fetchAVErrorMsg = "Server was unavailable. Try again."
          this.error = true
        return console.log(error)
      })
    return
  }
//fetch categories and save them in the state
  fetchCategories = (categoryNameArray) =>{
    let config = {
      headers: {
        'Access-Control-Allow-Origin': "*"
      }
    }
    let tempCategory;                                                 //variable to hold data of the response
    let manufacToBeFetched = [];                                      //array to save manufacturers that needs to be fetched
    //axios.all get promises
    let axiosGet = []                                                 
    categoryNameArray.forEach((category) =>{
      axiosGet.push(axios.get('/v2/products/'+ category, config))
    })
    
    axios.all(axiosGet)
    .then(resArrObj => {
      resArrObj.forEach(resArr => {
        console.log(resArr.data[0].type)
        if (resArr.status === 200) {         
          tempCategory = resArr.data;                      //1. Save the receiveddata in temp variable
          tempCategory.forEach(product =>{                //2. Check the manfufacturers
            if(!this.fetchedManufacturers.includes(product.manufacturer)){
              this.fetchedManufacturers.push(product.manufacturer)  //3.1. If manufacturers array doesn't have manufacturer, add it
              manufacToBeFetched.push(product.manufacturer)          //3.2. Add manufacturer also to fetching list
            }
          })
        
        this.setCategory(resArr.data[0].type,tempCategory);
        // tempCategory.forEach((product, index) => {
        //   axiosPass = true; //3. set axios pass true
        //   this.manufacturerAV.every(manufac => {
        //     if (manufac.manufacturer === product.manufacturer) { //5. check if any object match 
        //       axiosPass = false; //6. deny axios fetch if manufacturer already fetched
        //       this.addAvailability(manufac.data, tempCategory, index); //7.1. Add availability
        //       return false;
        //     }
        //     return true;
        //   });
        //   axiosPass && this.fetchAvailability(product.manufacturer, tempCategory, index); //7.2. fetch manufacturers availability
        // });
      }
    })
    })/*.then(()=>{
      tempManufacturers.length && this.fetchAvailability(tempManufacturers, tempCategory)//4. fetch the availability
    })*/
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

  componentDidMount = () => {
    this.fetchCategories(["beanies","gloves","facemasks"]); //fetch categories
  }

  fetchAVAgain = () =>{

  }
  render(){
    return(
      <Container>
        <div className="row">
          <div className="buttons">
            <Button className="button" value="beanies" id="getBeaniesButton" onClick={this.changeCategory}>Beanies</Button>
            <Button className="button" value="facemasks" id="getFacemasksButton" onClick={this.changeCategory}>Facemasks</Button>
            <Button className="button" value="gloves" id="getGlovesButton" onClick={this.changeCategory}>Gloves</Button>
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
