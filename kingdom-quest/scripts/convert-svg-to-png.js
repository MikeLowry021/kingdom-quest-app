const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Map marker SVGs to convert
const markers = [
  'marker-old-testament',
  'marker-new-testament',
  'marker-intertestamental',
  'marker-default'
];

// Directory where SVGs are stored
const svgDir = path.join(process.cwd(), 'public/images/map');

// Convert each SVG to PNG
async function convertSvgToPng() {
  for (const marker of markers) {
    const svgPath = path.join(svgDir, `${marker}.svg`);
    const pngPath = path.join(svgDir, `${marker}.png`);
    
    try {
      // Read the SVG file
      const svgBuffer = fs.readFileSync(svgPath);
      
      // Convert to PNG
      await sharp(svgBuffer)
        .png()
        .toFile(pngPath);
      
      console.log(`Converted ${marker}.svg to ${marker}.png`);
    } catch (error) {
      console.error(`Error converting ${marker}.svg:`, error);
    }
  }
}

// Run the conversion
convertSvgToPng().then(() => {
  console.log('All conversions completed');
}).catch(err => {
  console.error('Conversion failed:', err);
});
