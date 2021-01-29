import React from 'react';
import Button from 'react-bootstrap/Button'
import '../App.css';

//the table list component
//Map the given props to generate table of data
export default function Tabledata(props){
    
    return(
            <table>
                <thead>
                    <tr key="thead">
                        {props.tableHeaders.map((header, index)=>{
                            return (<th key={index}>{header}</th>)
                        })}
                    </tr>
                </thead>
                <tbody>
                    {props.categoryData ? props.categoryData.map((td,index)=>(
                        <tr key={index}>
                            <td>{td.id}</td>
                            <td>{td.name}</td>
                            <td>{td.color.join(", ")}</td>
                            <td>{td.price}</td>
                            <td>{td.manufacturer}</td>
                            {td.availability ? <td>{td.availability}</td> : <td><Button id={"button"+td.manufacturer+index} onClick={(event) => props.fetchAvailability(td.manufacturer, td.id,event)}>Fetch availability</Button></td>}
                            
                        </tr>
                    ))
                    :
                    <td key="noData"><tr>There was no category data. Try refresing page.</tr></td>
                }
                    
                </tbody>
            </table>
    )
}
