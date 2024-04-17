import logo from './logo.svg';
import './App.css';
import { useEffect, useState } from 'react';
import axios from 'axios'

function App() {
  const [seats, setSeats] = useState([])
  const [selected, setSelected] = useState(null)
  const [lockType, setLockType] = useState(null)

  const fetchData = async () => {
    await axios.get('http://100.0.253.29:9000/getSeats').then((res)=>{
      setSeats(res?.data)
    }).catch((err)=>{
      console.log("err:",err)
    })
  }

  useEffect(()=>{
    fetchData()
  },[])

  const handleBook = async () => {
    let data = {
      id : selected+1,
      isBooked : true,
      lockType: lockType
    }
    await axios.post('http://100.0.253.29:9000/bookSeat', data , {
      headers: {
        'Content-Type': 'application/json'
    }
    }).then((res)=>{
      alert(res.data.message)
      fetchData()
    }).catch((err)=>{
      console.log(err)
    })
  }

  return (
    <div className="App">
      <div style={{display:'flex', flexDirection:'row', justifyContent:'center'}}>
      <div style={{display:'flex', flexDirection:'column'}}>
      {
        seats?.slice(0,5)?.map((seat, index)=>{
          return (
          <div 
            key={index} 
            style={{padding:'10px', margin:'5px', width:'50px'}} 
            className={`${seat.isBooked ? 'red' : 'green'} ${selected === index ? 'border' : ''}`}
            onClick={()=>setSelected(index)}>
              <p>{seat?.id}</p>
          </div>
          )
        })
      }
      </div>
      <div style={{display:'flex', flexDirection:'column'}}>
      {
        seats?.slice(5,10)?.map((seat, index)=>{
          return (
          <div 
            key={6+index} 
            style={{padding:'10px', margin:'5px', width:'50px'}} 
            className={`${seat.isBooked ? 'red' : 'green'} ${selected === 5+index ? 'border' : ''}`}
            onClick={()=>setSelected(5+index)}>
              <p>{seat?.id}</p>
          </div>
          )
        })
      }
      </div>
      <div>
      <select onChange={(e)=>setLockType(e?.target?.value)} style={{padding:'15px', margin:'10px'}}>
        <option>Select Lock Type</option>
        <option value={'row'}>Row Level Lock</option>
        <option value={'table'}>Table Level Lock</option>
      </select>
      <button style={{padding:'15px', background:'lightblue'}} onClick={handleBook}>Book</button>
      </div>
      </div>
    </div>
  );
}

export default App;
