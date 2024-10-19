const request = require('supertest');
const express = require('express');
const inspectionsController = require('../controllers/inspections');
const { Inspections } = require('../models'); 
const app = express();

app.use(express.json());

app.get('/api/inspections/:camis', inspectionsController.getInspectionDetails);

describe('GET /api/inspections/:camis', () => {
  
  it('should return inspection details for a valid restaurant CAMIS', async () => {
    const mockInspectionsData = [
      {
        camis: '123456',
        inspection_date: '2024-01-01',
        violation_code: 'V001',
        violation_description: 'Some violation',
        Restaurant: {
          dba: 'Test Restaurant',
          cuisine_description: 'Italian',
          boro: 'Manhattan',
          building: '123',
          street: 'Main St',
          zipcode: '10001',
        },
      },
    ];

    jest.spyOn(Inspections, 'findAll').mockResolvedValue(mockInspectionsData);

    const res = await request(app).get('/api/inspections/123456');

    expect(res.statusCode).toEqual(200);

    expect(res.body).toEqual(mockInspectionsData);
  });

  it('should return 404 if no inspection data is found for a given CAMIS', async () => {
    jest.spyOn(Inspections, 'findAll').mockResolvedValue([]);

    const res = await request(app).get('/api/inspections/999999');

    expect(res.statusCode).toEqual(404);
    expect(res.body.error).toBe('Restaurant not found or no inspection data available.');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
});
