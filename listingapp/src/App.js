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
      fetchAVErrorMsg: null,                                      //Error message for availability fetching
      fetchCGErrorMsg: "Data is being fetched. Wait a moment..."  //Error message for category fetching
      
    }
    this.stockRegex = /<INSTOCKVALUE>(.*)<\/INSTOCKVALUE>/        //Regex to pick availavility from response
    this.manufacturerAV= []                                       //To hold fetched manufacturers' availability
    this.error = false;                                           //Error token
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
  //Function for finding the correct availability for selected product
  //params: 
  //  manufacturer == (string) selected product's manufacturer's name
  //  productID == (integer) the id of the product which availability is requested
  addAvailability =  (manufacturer, productID) =>{
    let manufacturerAV = this.manufacturerAV
    switch(this.state.currCategory){
      case "beanies":
        let beanies = this.state.beanies
        beanies.every((beanie, index)=>{    //Map through beanies category 
          beanie.id === productID && manufacturerAV.every(AV=>{ //if the correct beanie's id match the wanted productID map through manufacturers
            AV.manufacturer === manufacturer && AV.data.every(avData =>{ //when wanted manufacturer is founf map through the availability data of the manufacturer
              
              if(beanie.id === avData.id.toLowerCase()){
                beanies[index].availability = avData.DATAPAYLOAD.match(this.stockRegex)[1]
                this.setState({
                  beanies: beanies
                })
                return false //stop the loop when wanted data is found
              }
              return true //AV.data.every
            })
            return true //manufacturerAV.every
          })
          return true //beanies.every
        })
        return
      case "facemasks":
        let facemasks = this.state.facemasks
         facemasks.every((facemask, index)=>{
          facemask.id === productID && manufacturerAV.every(AV=>{
            AV.manufacturer === manufacturer && AV.data.every(avData =>{
              let avDataLC = avData.id.toLowerCase()
                if(facemask.id === avDataLC){
                  facemasks[index].availability = avData.DATAPAYLOAD.match(this.stockRegex)[1]
                  this.setState({
                    facemasks: facemasks
                  })
                  return false //stop the loop when wanted data is found
                }
                return true //AV.data.every
              })
              return true //manufacturerAV.every
            })
            return true //facemasks.every
        })
        return 
      case "gloves":
        let gloves = this.state.gloves
         gloves.every((glove, index)=>{
          glove.id === productID && manufacturerAV.every(AV=>{
            AV.manufacturer === manufacturer && AV.data.every(avData =>{
              let avDataLC = avData.id.toLowerCase()
                if(glove.id === avDataLC){
                  gloves[index].availability = avData.DATAPAYLOAD.match(this.stockRegex)[1]
                  this.setState({
                    gloves: gloves
                  })
                  return false //stop the loop when wanted data is found
                }
                return true //AV.data.every
              })
              return true //manufacturerAV.every
            })
            return true //gloves.every
        })
        return 
      default:
        return <p>No current caregory selected. Try pressing the button or reload the window</p>
    }
    
  }
  //Fetch the avaialability information from the API
  fetchAvailability = async (manufacturer, productID, event) =>{
    let config = {
      headers: {
        'Access-Control-Allow-Origin': "*"  //for passing CORS policy
      }
    }
    //Add buttonLink class to clicked button to launch scaling function when fetching is on
    let clickedButton = document.getElementById(event.target.id)
    !clickedButton.classList.contains("buttonLink") && (clickedButton.className += " buttonLink")

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

   
    if(axiosPass && !clickedButton.classList.contains("processing")){ //Check if axiosPass is true and the clicked button isn't already processing get request
      clickedButton.className += " processing"
      await axios.get('/v2/availability/'+ manufacturer, config)
      .then(res => { 
        if(res.status === 200){
          if(res.data.response.length && typeof res.data.response != "string"){
            this.manufacturerAV.push({"manufacturer": manufacturer, "data": res.data.response}) //save the response as an object to array
            clickedButton.classList.remove("processing","buttonLink")
          
          }else{ 
            clickedButton.classList.remove("processing","buttonLink")
            this.setState({
              fetchAVErrorMsg: "Fetching received nothing. Try again." //if received nothing, show error message
            })
            this.error = true
          }
        }else if(res.status === 404){
          clickedButton.classList.remove("processing","buttonLink")
          this.setState({
            fetchAVErrorMsg: "Availability of the manufacturer's product wasn't found. Try again."
          })
          this.error = true
        }else if(res.status === 503){
          clickedButton.classList.remove("processing","buttonLink")
          this.setState({
            fetchAVErrorMsg: "Server was unavailable. Try again."
          })
          this.error = true
        }
      }).then(()=> !this.error && this.addAvailability(manufacturer, productID))
      .catch(error =>{
        clickedButton.classList.remove("processing","buttonLink")
        this.setState({
          fetchAVErrorMsg: "Server was unavailable. Try again."
        })
        return console.log(error)
      })
    }
    return
  }
//fetch categories and save them in the state
  fetchCategories = () =>{
    let categories = ["gloves", "facemasks", "beanies"]
    let config = {
      headers: {
        'Access-Control-Allow-Origin': "*"
      }
    }
    categories.forEach((category) => {  
       axios.get('/v2/products/' + category, config)
      .then(res=>{
        switch(category){
          case "beanies":
            this.setState({
              currCategory: "beanies",
              beanies: res.data,
              rowLength: res.data.length
            });
            return;
          case "gloves":
              this.setState({
              gloves: res.data,
              rowLength: res.data.length
            });
            return;
          case "facemasks":
            this.setState({
              facemasks: res.data,
              rowLength: res.data.length
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
//to change current category
  changeCategory = (category) => {
    this.setState({
      currCategory: category.target.value
    })
    
  }

  componentDidMount = () => {
    this.fetchCategories()
  }
  render(){
    return(
      <Container>
        <div className="row">
          <div className="buttons">
            <Button className="button" value="beanies" id="getBeaniesButton" onClick={this.changeCategory}>Beanies</Button>
            <Button className="button" value="facemasks" id="getFacemasksButton" onClick={this.changeCategory}>Facemasks</Button>
            <Button className="button" value="gloves" id="getGlovesButton" onClick={this.changeCategory}>Gloves</Button>
            {this.state.fetchAVErrorMsg && <span id="avErrorSpan">{this.state.fetchAVErrorMsg}</span>}
          </div>
          <div className="table">
          {this.state.currCategory == null ? //show error message of category fetching or the table of the categories
          <h3 id="cgErrorH3">{this.state.fetchCGErrorMsg}</h3>
          :
          <TableData
            tableHeaders={["ID", "Name of "+this.state.currCategory, "Color(s)", "Price €", "Manufacturer", "Availability"]}
            categoryData={this.getCategory(this.state.currCategory)} 
            fetchAvailability={this.fetchAvailability}
            />
          }
          </div>
        </div>
      </Container>
        
      
    )
  }
}

export default App;
