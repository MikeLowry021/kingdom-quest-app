const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Route for the home page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Route for the map page
app.get('/map', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'map.html'));
});

// Start the server
app.listen(port, () => {
  console.log(`KingdomQuest Map Mini app listening at http://localhost:${port}`);
});
