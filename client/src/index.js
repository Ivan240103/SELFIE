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
      <ToastProvider
        placement='top-center'
        toastProps={{
          timeout: 2000,
          closeIcon: (
            <svg
              fill="none"
              height="32"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              width="32"
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          )
        }}
      />
      <App />
    </HeroUIProvider>
  </React.StrictMode>
);
