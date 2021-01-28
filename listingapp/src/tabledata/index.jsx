import React from 'react';
import Button from 'react-bootstrap/Button'
import '../App.css';
import InfiniteScroll from 'react-infinite-scroll-component'

export default function Tabledata(props){
    
    return(
        // <InfiniteScroll
        //     dataLength={2}
        //     hasMore={true}
        //     loader={<h4>Loading...</h4>}
        // >
            <table>
                <thead>
                    <tr key="thead">
                        {props.tableHeaders.map((header, index)=>{
                            return (<th key={index}>{header}</th>)
                        })}
                    </tr>
                </thead>
                <tbody>
                    {props.categoryData.map((td,index)=>(
                        
                        <tr key={index}>
                            <td>{td.id}</td>
                            <td>{td.name}</td>
                            <td>{td.color.join(", ")}</td>
                            <td>{td.price}</td>
                            <td>{td.manufacturer}</td>
                            {td.availability ? <td>{td.availability}</td> : <td><Button id={"button"+td.manufacturer+index} onClick={(event) => props.fetchAvailability(td.manufacturer, td.id,event)}>Fetch availability</Button></td>}
                            
                        </tr>
                    ))}
                    
                </tbody>
            </table>
        // </InfiniteScroll>
    )
}
