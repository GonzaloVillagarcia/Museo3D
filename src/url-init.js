import * as THREE from 'three'

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
