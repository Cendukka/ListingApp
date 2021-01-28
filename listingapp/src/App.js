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
      currCategory: null,
      beanies: null,
      facemasks: null,
      gloves: null,
      fetchAVErrorMsg: null,
      fetchCGErrorMsg: "Data is being fetched. Wait a moment..."
      
    }
    this.stockRegex = /<INSTOCKVALUE>(.*)<\/INSTOCKVALUE>/
    this.manufacturerAV= []
    this.error = false;
    
    
    
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
  addAvailability = async (manufacturer, productID) =>{
    let manufacturerAV = this.manufacturerAV
    switch(this.state.currCategory){
      case "beanies":
        let beanies = this.state.beanies
        await beanies.every((beanie, index)=>{
          beanie.id === productID && manufacturerAV.map(AV=>{
            AV.manufacturer === manufacturer && AV.data.map(avData =>{
              let avDataLC = avData.id.toLowerCase()
                if(beanie.id === avDataLC){
                  beanies[index].availability = avData.DATAPAYLOAD.match(this.stockRegex)[1]
                  this.setState({
                    beanies: beanies
                  })
                }
            })
            return false
          })
          return true
        })
        return
      case "facemasks":
        let facemasks = this.state.facemasks
        await facemasks.every((facemask, index)=>{
          facemask.id === productID && manufacturerAV.map(AV=>{
            AV.manufacturer === manufacturer && AV.data.map(avData =>{
              let avDataLC = avData.id.toLowerCase()
                if(facemask.id === avDataLC){
                  facemasks[index].availability = avData.DATAPAYLOAD.match(this.stockRegex)[1]
                  this.setState({
                    facemasks: facemasks
                  })
                }
            })
            return false
          })
          return true
        })
        return 
      case "gloves":
        let gloves = this.state.gloves
        await gloves.every((glove, index)=>{
          glove.id === productID && manufacturerAV.map(AV=>{
            AV.manufacturer === manufacturer && AV.data.map(avData =>{
              let avDataLC = avData.id.toLowerCase()
                if(glove.id === avDataLC){
                  gloves[index].availability = avData.DATAPAYLOAD.match(this.stockRegex)[1]
                  this.setState({
                    gloves: gloves
                  })
                }
            })
            return false
          })
          return true
        })
        return 
      default:
        return <p>No current caregory selected. Try pressing the button or reload the window</p>
    }
    
  }
  fetchAvailability = async (manufacturer, productID, event) =>{
    let config = {
      headers: {
        'Access-Control-Allow-Origin': "*",
        'x-force-error-mode': 'all'
      }
    }
    let clickedButton = document.getElementById(event.target.id)
    !clickedButton.classList.contains("buttonLink") && (clickedButton.className += " buttonLink")
    
    let axiosPass = true;
    // check if manufacturer is already fetched before
    this.manufacturerAV.every(manufac =>{
      if(manufac.manufacturer === manufacturer){
        axiosPass = false;
        this.addAvailability(manufacturer, productID)
        return false;
      }
      return true;
    })

   
    if(axiosPass && !clickedButton.classList.contains("processing")){
      clickedButton.className += " processing"
      await axios.get('/v2/availability/'+ manufacturer, config)
      .then(res => { 
        if(res.status === 200){
          if(res.data.response.length && typeof res.data.response != "string"){
            this.manufacturerAV.push({"manufacturer": manufacturer, "data": res.data.response})
            clickedButton.classList.remove("processing","buttonLink")
          
          }else{
            clickedButton.classList.remove("processing","buttonLink")
            this.setState({
              fetchAVErrorMsg: "Fetching received nothing. Try again."
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


  fetchCategories = () =>{
    let categories = ["gloves", "facemasks", "beanies"]
    let config = {
      headers: {
        'Access-Control-Allow-Origin': "*",
        'x-force-error-mode': 'all'
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
          {this.state.currCategory == null ? 
          <h3 id="cgErrorH3">{this.state.fetchCGErrorMsg}</h3>
          :
          <TableData
            tableHeaders={["ID", "Name of "+this.state.currCategory, "Color(s)", "Price €", "Manufacturer", "Availability"]}
            categoryData={this.getCategory()} 
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
