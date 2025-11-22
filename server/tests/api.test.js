const request = require('supertest');
const app = require('../index');

describe('API Endpoints', () => {
    it('GET /api/restaurants should return a list of restaurants', async () => {
        const res = await request(app).get('/api/restaurants');
        expect(res.statusCode).toEqual(200);
        expect(Array.isArray(res.body)).toBeTruthy();
        expect(res.body.length).toBeGreaterThan(0);

        // Check structure of the first restaurant
        const restaurant = res.body[0];
        expect(restaurant).toHaveProperty('id');
        expect(restaurant).toHaveProperty('name');
        expect(restaurant).toHaveProperty('address');
        expect(restaurant).toHaveProperty('coordinates');
    });

    it('GET /api/place-details/:placeId should return mock details', async () => {
        const res = await request(app).get('/api/place-details/123');
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('message', 'Place details proxy endpoint');
    });
});
