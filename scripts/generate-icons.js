import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(
    import.meta.url);
const __dirname = path.dirname(__filename);

// Create a simple SVG icon generator
function createSVGIcon(size, filename) {
    const svg = `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#2563eb;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#1d4ed8;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- Background circle -->
  <circle cx="${size/2}" cy="${size/2}" r="${size*0.4}" fill="url(#grad1)" stroke="#ffffff" stroke-width="${size*0.02}"/>
  
  <!-- Medical cross -->
  <rect x="${size*0.4}" y="${size*0.3}" width="${size*0.2}" height="${size*0.4}" fill="#ffffff" rx="${size*0.02}"/>
  <rect x="${size*0.3}" y="${size*0.4}" width="${size*0.4}" height="${size*0.2}" fill="#ffffff" rx="${size*0.02}"/>
  
  <!-- Heart symbol -->
  <path d="M${size/2} ${size*0.7} C${size/2} ${size*0.7}, ${size*0.35} ${size*0.6}, ${size*0.35} ${size*0.5} C${size*0.35} ${size*0.45}, ${size*0.45} ${size*0.45}, ${size/2} ${size*0.5} C${size*0.55} ${size*0.45}, ${size*0.65} ${size*0.45}, ${size*0.65} ${size*0.5} C${size*0.65} ${size*0.6}, ${size/2} ${size*0.7}, ${size/2} ${size*0.7} Z" fill="#ffffff" opacity="0.8"/>
  
  ${size >= 192 ? `<text x="${size/2}" y="${size*0.9}" font-family="Arial, sans-serif" font-size="${size*0.08}" font-weight="bold" text-anchor="middle" fill="#ffffff">MediFlow</text>` : ''}
</svg>`;

    fs.writeFileSync(path.join(__dirname, '..', 'public', filename), svg);
    console.log(`Created ${filename}`);
}

// Generate icons
console.log('Generating MediFlow icons...');

// Create SVG icons
createSVGIcon(192, 'icon-192x192.png');
createSVGIcon(512, 'icon-512x512.png');
createSVGIcon(72, 'badge-72x72.png');

// Also create SVG versions
createSVGIcon(192, 'icon-192.svg');
createSVGIcon(512, 'icon-512.svg');

console.log('Icons generated successfully!');
console.log('Note: The .png files are actually SVG files. For production, convert these to actual PNG format.');