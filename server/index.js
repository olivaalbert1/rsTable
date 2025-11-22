const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const DATA_FILE = path.join(__dirname, '../data/restaurants.json');

// Helper to read data
const readData = () => {
    try {
        const data = fs.readFileSync(DATA_FILE, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        console.error('Error reading data file:', err);
        return [];
    }
};

// GET /api/restaurants
app.get('/api/restaurants', (req, res) => {
    const restaurants = readData();
    res.json(restaurants);
});

// GET /api/place-details/:placeId (Proxy for Google Maps if needed later)
// For now, we'll just return the data we have or a mock.
app.get('/api/place-details/:placeId', (req, res) => {
    // Placeholder for future Google Maps API server-side call
    res.json({ message: "Place details proxy endpoint" });
});

// Only listen if not in test mode
if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
}

module.exports = app;
