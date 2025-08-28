const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Location SVGs to convert
const locations = [
  'jerusalem',
  'bethlehem',
  'sea-of-galilee'
];

// Directory where location SVGs are stored
const svgDir = path.join(process.cwd(), 'public/images/map/locations');

// Convert each SVG to PNG
async function convertSvgToPng() {
  for (const location of locations) {
    const svgPath = path.join(svgDir, `${location}.svg`);
    const pngPath = path.join(svgDir, `${location}.png`);
    
    try {
      // Read the SVG file
      const svgBuffer = fs.readFileSync(svgPath);
      
      // Convert to PNG
      await sharp(svgBuffer)
        .png()
        .toFile(pngPath);
      
      console.log(`Converted ${location}.svg to ${location}.png`);
    } catch (error) {
      console.error(`Error converting ${location}.svg:`, error);
    }
  }
}

// Run the conversion
convertSvgToPng().then(() => {
  console.log('All location conversions completed');
}).catch(err => {
  console.error('Location conversion failed:', err);
});
