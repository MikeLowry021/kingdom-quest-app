// Convert SVGs to JPGs
const fs = require('fs');
const path = require('path');

// Function to create a simple image tag
function createImageTag(src, alt) {
  return `<img src="${src}" alt="${alt}">`;
}

// Jerusalem image HTML
const jerusalemHtml = `
<!DOCTYPE html>
<html>
<head>
  <title>Jerusalem</title>
</head>
<body>
  <div style="width: 800px; height: 600px; background-color: #f8f4e3;">
    <h1 style="text-align: center; padding-top: 50px; font-family: Arial; color: #614b3a;">Ancient Jerusalem</h1>
    <div style="text-align: center; margin-top: 50px;">
      <div style="width: 300px; height: 200px; background-color: #d4b483; margin: 0 auto; border: 4px solid #8a7967;">
        <!-- Simplified Temple representation -->
        <div style="width: 0; height: 0; border-left: 50px solid transparent; border-right: 50px solid transparent; border-bottom: 70px solid #e6c88a; margin: 0 auto;"></div>
        <div style="width: 180px; height: 130px; background-color: #e6c88a; margin: 0 auto;"></div>
      </div>
      <p style="margin-top: 30px; font-family: Arial; color: #614b3a; font-size: 24px;">The holy city and capital of ancient Israel</p>
    </div>
  </div>
</body>
</html>
`;

// Bethlehem image HTML
const bethlehemHtml = `
<!DOCTYPE html>
<html>
<head>
  <title>Bethlehem</title>
</head>
<body>
  <div style="width: 800px; height: 600px; background-color: #f8f4e3;">
    <h1 style="text-align: center; padding-top: 50px; font-family: Arial; color: #614b3a;">Bethlehem</h1>
    <div style="text-align: center; margin-top: 50px;">
      <div style="width: 300px; height: 200px; background-color: #e6c88a; margin: 0 auto; border: 4px solid #8a7967;">
        <!-- Simplified Stable representation -->
        <div style="width: 180px; height: 120px; background-color: #d4b483; margin: 0 auto; border: 2px solid #614b3a; margin-top: 40px;"></div>
        <div style="width: 40px; height: 60px; background-color: #614b3a; position: relative; top: -100px; left: 130px;"></div>
      </div>
      <p style="margin-top: 30px; font-family: Arial; color: #614b3a; font-size: 24px;">Birthplace of Jesus Christ</p>
    </div>
  </div>
</body>
</html>
`;

// Write HTML files
fs.writeFileSync(path.join(__dirname, 'public/images/locations/jerusalem.html'), jerusalemHtml);
fs.writeFileSync(path.join(__dirname, 'public/images/locations/bethlehem.html'), bethlehemHtml);

console.log('HTML files created successfully.');
