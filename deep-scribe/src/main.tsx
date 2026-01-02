import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { ErrorBoundary } from './components/ErrorBoundary'
import './index.css'

// Log Export System: Intercept console logs and send to Electron
if (window.electronAPI && window.electronAPI.logger) {
  const originalLog = console.log;
  const originalError = console.error;
  const originalWarn = console.warn;

  console.log = (message?: any, ...optionalParams: any[]) => {
    window.electronAPI.logger.log('info', message, ...optionalParams);
    originalLog(message, ...optionalParams);
  };

  console.error = (message?: any, ...optionalParams: any[]) => {
    window.electronAPI.logger.log('error', message, ...optionalParams);
    originalError(message, ...optionalParams);
  };

  console.warn = (message?: any, ...optionalParams: any[]) => {
    window.electronAPI.logger.log('warn', message, ...optionalParams);
    originalWarn(message, ...optionalParams);
  };
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
)
