import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import * as THREE from 'three'
import './index.css'
import App from './App.jsx'

window.getAssetPath = (path) => {
  if (typeof path !== 'string') return path;
  if (!path) return path;
  if (path.startsWith('http') || path.startsWith('data:') || path.startsWith('blob:')) return path;
  const base = import.meta.env.BASE_URL || '/';
  if (path.startsWith('/') && !path.startsWith('//')) {
    if (base !== '/' && !path.startsWith(base)) {
      return base.endsWith('/') ? base + path.slice(1) : base + path;
    }
  }
  return path;
};

THREE.DefaultLoadingManager.setURLModifier((url) => {
  return window.getAssetPath(url);
});


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)