import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import ErrorBoundary from './shared/ErrorBoundary.jsx';
import { installErrorLogging } from './shared/installErrorLogging.js';
import './styles/base.css';

installErrorLogging();

createRoot(document.getElementById('root')).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>,
);
