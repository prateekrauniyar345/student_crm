import { useState, useEffect } from 'react'
import './App.css'

// tes the api endpoint
import { getDefaultData } from "./api/default"

function App() {
  const [count, setCount] = useState(0)

  const [data, setData] = useState(null); 


  useEffect(() => {
    try {
      getDefaultData().then((response) => {
        setData(response);
        console.log("Default data fetched successfully:", response);
      }).catch((error) => {
        console.error("Error fetching default data:", error);
      });
    } catch (error) {
      console.error("Unexpected error:", error);
    }
  }, []);

  return (
    <>

    <h1>React frontend</h1>

      
    </>
  )
}

export default App
