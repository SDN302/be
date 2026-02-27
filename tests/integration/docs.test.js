const request = require('supertest');
const httpStatus = require('http-status');
const app = require('../../src/app');
const setupTestDB = require('../utils/setupTestDB');

setupTestDB();

describe('Docs routes', () => {
  describe('GET /v1/docs', () => {
    test('should return 404 when running in production', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      await request(app).get('/v1/docs').send().expect(httpStatus.NOT_FOUND);

      process.env.NODE_ENV = originalEnv;
    });
  });
});
