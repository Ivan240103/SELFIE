import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { 
  HeroUIProvider,
  ToastProvider
} from "@heroui/react";

import './css/global.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <HeroUIProvider>
      <ToastProvider placement='top-center' toastProps={{ timeout: 3000 }}/>
      <App />
    </HeroUIProvider>
  </React.StrictMode>
);
