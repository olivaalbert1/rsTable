const { GoogleSpreadsheet } = require('google-spreadsheet');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const CREDENTIALS = {
    client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY ? process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n') : undefined,
};
const SHEET_ID = process.env.GOOGLE_SHEET_ID;

const DATA_FILE = path.join(__dirname, '../data/restaurants.json');

async function sync() {
    if (!CREDENTIALS.client_email || !CREDENTIALS.private_key || !SHEET_ID) {
        console.error('Missing Google Sheets credentials or Sheet ID.');
        process.exit(1);
    }

    try {
        const doc = new GoogleSpreadsheet(SHEET_ID);
        await doc.useServiceAccountAuth(CREDENTIALS);
        await doc.loadInfo();

        const sheet = doc.sheetsByIndex[0];
        const rows = await sheet.getRows();

        const restaurants = rows.map(row => ({
            id: row.id || Math.random().toString(36).substr(2, 9),
            visited: row.visited === 'TRUE' || row.visited === 'true',
            name: row.name,
            address: row.address,
            googleMapsUrl: row.googleMapsUrl,
            placeId: row.placeId,
            openingHours: row.openingHours ? row.openingHours.split('|').map(s => s.trim()) : [],
            comments: row.comments,
            coordinates: {
                lat: parseFloat(row.lat) || 0,
                lng: parseFloat(row.lng) || 0
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
