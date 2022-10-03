import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import 'normalize.css';
import './index.css';
import { HelmetProvider } from 'react-helmet-async';
import { RootStoreProvider } from './store/RootStoreProvider';
import { BrowserRouter as Router } from 'react-router-dom';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement,
);

root.render(
  <React.StrictMode>
    <HelmetProvider>
      <Router>
        <RootStoreProvider>
          <App />
        </RootStoreProvider>
      </Router>
    </HelmetProvider>
  </React.StrictMode>,
);
