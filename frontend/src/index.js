import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App.jsx';
import store from './store/index.js';
import { Provider } from 'react-redux';
import reportWebVitals from './reportWebVitals.js';

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>,
  document.getElementById('root')
);

reportWebVitals();
