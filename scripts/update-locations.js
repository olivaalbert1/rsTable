const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '../data/restaurants.json');

// Helper to delay execution (to respect API rate limits)
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Helper to geocode address using OpenStreetMap Nominatim API
async function geocodeAddress(address) {
    if (!address) return { lat: 0, lng: 0 };

    try {
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`;
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'RsTableApp/1.0 (github.com/olivaalbert1/rsTable)',
                'Referer': 'https://github.com/olivaalbert1/rsTable'
            }
        });

        if (!response.ok) {
            if (response.status === 403) {
                console.warn("   -> API Rate Limit or Blocked (403). Skipping coordinates.");
                return { lat: 0, lng: 0 };
            }
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data && data.length > 0) {
            return {
                lat: parseFloat(data[0].lat),
                lng: parseFloat(data[0].lon)
            };
        }
    } catch (error) {
        console.error(`Error geocoding address "${address}":`, error.message);
    }

    return { lat: 0, lng: 0 };
}

async function updateLocations() {
    try {
        const rawData = fs.readFileSync(DATA_FILE, 'utf8');
        let restaurants = JSON.parse(rawData);
        let updatedCount = 0;

        console.log(`Processing ${restaurants.length} restaurants...`);

        for (let i = 0; i < restaurants.length; i++) {
            const restaurant = restaurants[i];
            let modified = false;

            // 1. Update Google Maps URL if missing
            if (!restaurant.googleMapsUrl && restaurant.address) {
                restaurant.googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(restaurant.address)}`;
                console.log(`[${i + 1}/${restaurants.length}] Added Maps URL for: ${restaurant.name}`);
                modified = true;
            }

            // 2. Update Coordinates if missing (0,0)
            if ((restaurant.coordinates.lat === 0 || restaurant.coordinates.lng === 0) && restaurant.address) {
                console.log(`[${i + 1}/${restaurants.length}] Fetching coordinates for: ${restaurant.name} (${restaurant.address})`);
                const coords = await geocodeAddress(restaurant.address);

                if (coords.lat !== 0 || coords.lng !== 0) {
                    restaurant.coordinates = coords;
                    console.log(`   -> Found: ${coords.lat}, ${coords.lng}`);
                    modified = true;
                    // Wait 1 second between requests to respect Nominatim rate limits
                    await delay(1000);
                } else {
                    console.log(`   -> Could not find coordinates.`);
                }
            }

            if (modified) {
                updatedCount++;
            }
        }

        if (updatedCount > 0) {
            fs.writeFileSync(DATA_FILE, JSON.stringify(restaurants, null, 2));
            console.log(`\nSuccessfully updated ${updatedCount} restaurants.`);
        } else {
            console.log('\nNo updates were needed.');
        }

    } catch (error) {
        console.error('Error updating locations:', error);
    }
}

updateLocations();
