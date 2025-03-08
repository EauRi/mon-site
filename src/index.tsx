import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';  // Assure-toi d'importer le fichier CSS ici

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
