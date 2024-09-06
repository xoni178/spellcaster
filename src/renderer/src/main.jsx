import './main.css'

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { DataContext } from './DataContext/DataContext'

ReactDOM.createRoot(document.getElementById('root')).render(
  <DataContext>
    <App />
  </DataContext>
)
