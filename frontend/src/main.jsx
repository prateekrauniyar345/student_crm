import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// for bootstrap
// import stylesheets
import 'bootstrap/dist/css/bootstrap.min.css';
// import javascript
import 'bootstrap/dist/js/bootstrap.bundle.min.js';


// css style for the react-toastify notifications
import 'react-toastify/dist/ReactToastify.css';



createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
