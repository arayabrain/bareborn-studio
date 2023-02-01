import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import App from './App'
import reportWebVitals from './reportWebVitals'
import { Provider } from 'react-redux'
import { store } from 'store/store'
import { ThemeProvider } from '@mui/material/styles'
import { theme } from './Theme'
import { initializeApp } from 'firebase/app'

const firebaseConfig = {
  apiKey: 'AIzaSyD6WG77bzWqMJ0MljPJZYfhgWutC5b4w5w',
  authDomain: 'optinist-3d2bb.firebaseapp.com',
  projectId: 'optinist-3d2bb',
  storageBucket: 'optinist-3d2bb.appspot.com',
  messagingSenderId: '778268336297',
  appId: '1:778268336297:web:3b129a0c33d2875e6fc9b8',
  measurementId: 'G-L9DY3MM5ZW',
  databaseURL: '',
}

initializeApp(firebaseConfig)

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <App />
      </ThemeProvider>
    </Provider>
  </React.StrictMode>,
  document.getElementById('root'),
)

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()
