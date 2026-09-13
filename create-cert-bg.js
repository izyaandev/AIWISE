const sharp = require('sharp');
const fs = require('fs');

const svg = `
<svg width="842" height="595" xmlns="http://www.w3.org/2000/svg">
  <!-- Background -->
  <rect width="842" height="595" fill="#f8f9fa"/>
  
  <!-- Left Purple Polygon -->
  <polygon points="50,0 350,0 350,400 150,595 50,595" fill="#581c87"/>
  
  <!-- Accent Shapes -->
  <!-- Yellow underline for name (we will draw text over this) -->
  <rect x="420" y="320" width="300" height="4" fill="#eab308"/>
  
  <!-- Yellow angled bar top center -->
  <polygon points="450,0 500,0 450,50 400,50" fill="#eab308"/>
  
  <!-- Magenta rectangle top right -->
  <rect x="620" y="40" width="150" height="30" fill="#d946ef"/>
  
  <!-- Purple triangle right edge -->
  <polygon points="842,150 780,210 842,270" fill="#581c87"/>
  
  <!-- Bottom left triangles -->
  <polygon points="170,500 230,440 290,500" fill="#581c87"/>
  <polygon points="290,500 350,440 410,500" fill="#d946ef"/>
  
  <!-- Decorative Dots -->
  <!-- Top Right Dots -->
  <circle cx="650" cy="100" r="3" fill="#eab308"/>
  <circle cx="670" cy="100" r="3" fill="#eab308"/>
  <circle cx="690" cy="100" r="3" fill="#eab308"/>
  <circle cx="710" cy="100" r="3" fill="#eab308"/>
  <circle cx="650" cy="120" r="3" fill="#eab308"/>
  <circle cx="670" cy="120" r="3" fill="#eab308"/>
  <circle cx="690" cy="120" r="3" fill="#eab308"/>
  <circle cx="710" cy="120" r="3" fill="#eab308"/>
  
  <!-- Bottom Left Dots -->
  <circle cx="90" cy="480" r="3" fill="#eab308"/>
  <circle cx="110" cy="480" r="3" fill="#eab308"/>
  <circle cx="130" cy="480" r="3" fill="#eab308"/>
  <circle cx="150" cy="480" r="3" fill="#eab308"/>
</svg>
`;

sharp(Buffer.from(svg))
  .png()
  .toFile('public/cert-bg.png')
  .then(() => console.log('Certificate background generated successfully!'))
  .catch(err => console.error('Error generating certificate background:', err));
