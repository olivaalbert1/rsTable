const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const SHEET_ID = process.env.GOOGLE_SHEET_ID;
const DATA_FILE = path.join(__dirname, '../data/restaurants.json');

async function sync() {
    if (!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY || !SHEET_ID) {
        console.error('Missing Google Sheets credentials or Sheet ID.');
        process.exit(1);
    }

    const serviceAccountAuth = new JWT({
        email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        scopes: [
            'https://www.googleapis.com/auth/spreadsheets',
        ],
    });

    try {
        const doc = new GoogleSpreadsheet(SHEET_ID, serviceAccountAuth);
        await doc.loadInfo();

        const sheet = doc.sheetsByIndex[0];
        const rows = await sheet.getRows();

        console.log('Sheet Headers:', sheet.headerValues);

        // Create a map for case-insensitive header lookup
        const headerMap = {};
        sheet.headerValues.forEach(h => {
            headerMap[h.toLowerCase()] = h;
        });

        const getValue = (row, key) => {
            const actualKey = headerMap[key.toLowerCase()];
            if (!actualKey) return undefined;
            return row.get(actualKey);
        };

        if (rows.length > 0) {
            console.log('First row sample data:', {
                name: getValue(rows[0], 'name'),
                address: getValue(rows[0], 'address')
            });
        }

        const restaurants = rows.map(row => ({
            id: getValue(row, 'id') || Math.random().toString(36).substr(2, 9),
            visited: getValue(row, 'visited') === 'TRUE' || getValue(row, 'visited') === 'true' || getValue(row, 'visited') === true,
            name: getValue(row, 'name'),
            address: getValue(row, 'address'),
            googleMapsUrl: getValue(row, 'googleMapsUrl'),
            placeId: getValue(row, 'placeId'),
            openingHours: getValue(row, 'openingHours') ? getValue(row, 'openingHours').split('|').map(s => s.trim()) : [],
            comments: getValue(row, 'comments'),
            coordinates: {
                lat: parseFloat(getValue(row, 'lat')) || 0,
                lng: parseFloat(getValue(row, 'lng')) || 0
            },
            lastUpdated: new Date().toISOString()
        }));

        fs.writeFileSync(DATA_FILE, JSON.stringify(restaurants, null, 2));
        console.log(`Successfully synced ${restaurants.length} restaurants.`);

    } catch (error) {
        console.error('Error syncing with Google Sheets:', error);
        process.exit(1);
    }
}

sync();
