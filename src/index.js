import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

import App from './Applocal';
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
const isLocalhost = window.location.hostname === 'localhost';