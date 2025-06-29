import L from 'leaflet';

// Fix for default markers in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'public/images/marker-icon-2x.png',
  iconUrl: 'public/images/marker-icon.png',
  shadowUrl:'public/images/marker-shadow.png'
});

export default L;
