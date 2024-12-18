const express = require('express');
const request = require('supertest');
const { addUserPlan, getAllUserPlans, deleteUserPlan, updateUserPlan } = require('../controllers/addPlan');
const { authentication } = require('../controllers/authController');
const globalErrorHandler = require('../controllers/errorController');
const { Restaurants, UserPlan } = require('../models');

jest.mock('../models');
jest.mock('../controllers/authController');

describe('UserPlanController', () => {
    let app;

    beforeAll(() => {
        app = express();
        app.use(express.json());

        // Define the routes within the test app
        app.post('/api/v1/user-plans/add', authentication, addUserPlan);
        app.get('/api/v1/user-plans/plan-data', authentication, getAllUserPlans);
        app.put('/api/v1/user-plans/update', authentication, updateUserPlan);
        app.delete('/api/v1/user-plans/remove', authentication, deleteUserPlan);

        // Use the error handler
        app.use(globalErrorHandler);
    });

    let mockUser;

    beforeEach(() => {
        mockUser = { id: 1 };
        authentication.mockImplementation((req, res, next) => {
            req.user = mockUser;
            next();
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    // Tests for POST /api/v1/user-plans/add
    describe('POST /api/v1/user-plans/add', () => {
        it('should return an error if the user event already exists', async () => {
            // Mocking the Restaurant model to return a restaurant with the given camis
            Restaurants.findOne.mockResolvedValue({ camis: '12345' });
    
            // Mocking UserPlan.findOne to return an existing user plan (event already exists)
            UserPlan.findOne.mockResolvedValue({
                id: 1,
                userId: 1, // Mock user ID
                camis: '12345',
                longitude: '40.7128',
                latitude: '-74.0060',
                date: '2024-01-01',
                time: '12:00',
                eventName: 'Lunch Event',
                endDate: '2024-01-01',
                endTime: '14:00',
                eventType: 'Self Event',
            });
    
            // Sending the POST request to create a new user plan
            const res = await request(app)
                .post('/api/v1/user-plans/add')
                .send({
                    camis: '12345',
                    longitude: '40.7128',
                    latitude: '-74.0060',
                    date: '2024-01-01',
                    time: '12:00',
                    eventName: 'Lunch Event', // Same event name, so the plan should already exist
                    endDate: '2024-01-01',
                    endTime: '14:00',
                    eventType: 'Self Event',
                })
                .set('Authorization', `Bearer mockToken`); // Mock the token to simulate authenticated user
    
            // Asserting the response
            expect(res.statusCode).toEqual(400); // Should return status 400 for a conflict/error
            expect(res.body.status).toEqual('fail'); // The response should indicate an error
            expect(res.body.message).toEqual('An event with the same name, date, and time already exists.'); // Ensure the error message is correct
        });
    
        it('should create a new user plan', async () => {
         
            Restaurants.findOne.mockResolvedValueOnce({ camis: '12345' });
            UserPlan.findOne.mockResolvedValueOnce(null);

            UserPlan.create.mockResolvedValue({
                id: 1,
                userId: mockUser.id,
                camis: '12345',
                longitude: '40.7128',
                latitude: '-74.0060',
                date: '2024-01-01',
                time: '12:00',
                eventName: 'Lunch Event',
                endDate: '2024-01-01',
                endTime: '14:00',
                eventType: 'Self Event',
            });

            const res = await request(app)
                .post('/api/v1/user-plans/add')
                .send({
                    camis: '12345',
                    longitude: '40.7128',
                    latitude: '-74.0060',
                    date: '2024-01-01',
                    time: '12:00',
                    eventName: 'Lunch Event',
                    endDate: '2024-01-01',
                    endTime: '14:00',
                    eventType: 'Self Event',
                })
                .set('Authorization', `Bearer mockToken`);

            expect(res.statusCode).toEqual(201);
            expect(res.body.status).toEqual('success');
            expect(res.body.data).toHaveProperty('userPlan');
        });

        it('should fail if the restaurant is not found', async () => {
            Restaurants.findOne.mockResolvedValue(null);

            const res = await request(app)
                .post('/api/v1/user-plans/add')
                .send({
                    camis: '12345',
                    longitude: '40.7128',
                    latitude: '-74.0060',
                    date: '2024-01-01',
                    time: '12:00',
                    eventName: 'Lunch Event',
                    endDate: '2024-01-01',
                    endTime: '14:00',
                    eventType: 'Self Event',
                })
                .set('Authorization', `Bearer mockToken`);

            expect(res.statusCode).toEqual(404);
            expect(res.body.message).toEqual('Restaurant not found');
        });
    });

    // Tests for GET /api/v1/user-plans/plan-data
    describe('GET /api/v1/user-plans/plan-data', () => {
        it('should retrieve user plans', async () => {
            UserPlan.findAll.mockResolvedValue([
                {
                    id: 1,
                    userId: mockUser.id,
                    camis: '12345',
                    longitude: '40.7128',
                    latitude: '-74.0060',
                    date: '2024-01-01',
                    time: '12:00',
                    eventName: 'Lunch Event',
                    endDate: '2024-01-01',
                    endTime: '14:00',
                    eventType: 'Self Event',
                },
            ]);

            const res = await request(app)
                .get('/api/v1/user-plans/plan-data')
                .set('Authorization', `Bearer mockToken`);

            expect(res.statusCode).toEqual(200);
            expect(res.body.status).toEqual('success');
            expect(res.body.data.userPlans).toHaveLength(1);
        });

        it('should return empty if no user plans exist', async () => {
            UserPlan.findAll.mockResolvedValue([]);

            const res = await request(app)
                .get('/api/v1/user-plans/plan-data')
                .set('Authorization', `Bearer mockToken`);

            expect(res.statusCode).toEqual(200);
            expect(res.body.data.userPlans).toHaveLength(0);
        });
    });

    // Tests for DELETE /api/v1/user-plans/remove
    describe('DELETE /api/v1/user-plans/remove', () => {
        it('should delete a user plan', async () => {
            UserPlan.findByPk.mockResolvedValue({
                id: 1,
                destroy: jest.fn(),
            });

            const res = await request(app)
                .delete('/api/v1/user-plans/remove')
                .query({ id: 1 })
                .set('Authorization', `Bearer mockToken`);

            expect(res.statusCode).toEqual(201);
            expect(res.body.status).toEqual('success');
        });

        it('should fail if the plan is not found', async () => {
            UserPlan.findByPk.mockResolvedValue(null);

            const res = await request(app)
                .delete('/api/v1/user-plans/remove')
                .query({ id: 1 })
                .set('Authorization', `Bearer mockToken`);

            expect(res.statusCode).toEqual(400);
            expect(res.body.message).toEqual('No plan with ID');
        });

        it('should return 400 if no id is provided in query', async () => {
            const res = await request(app)
              .delete('/api/v1/user-plans/remove')
              .query({}) // No id in the query

            expect(res.statusCode).toBe(400);
            expect(res.body.status).toBe('fail');
            expect(res.body.message).toBe('No plan ID');
          });

          it('should return 500 if there is an error deleting the user plan', async () => {
            const mockError = new Error('Database error');
            const mockDestroy = jest.fn().mockRejectedValue(mockError); // Simulate a rejection during destroy
            UserPlan.findByPk.mockResolvedValue({
              destroy: mockDestroy,
            });
        
            const res = await request(app)
              .delete('/api/v1/user-plans/remove')
              .query({ id: '123' }); // Pass a mock id
        
            expect(res.statusCode).toBe(500);
            expect(res.body.status).toBe('error');
            expect(res.body.message).toBe('Failed to add user plan'); // Check error message
          });
    });

    // Tests for PUT /api/v1/user-plans/update
    describe('PUT /api/v1/user-plans/update', () => {
        it('should update a user plan', async () => {
            UserPlan.findByPk.mockResolvedValue({
                id: 1,
                date: '2024-01-01',
                time: '12:00',
                endDate: '2024-01-01',
                endTime: '14:00',
                save: jest.fn(),
            });

            const res = await request(app)
                .put('/api/v1/user-plans/update')
                .query({ id: 1 })
                .send({
                    date: '2024-02-01',
                    time: '14:00',
                    endDate: '2024-02-01',
                    endTime: '16:00',
                    eventType: 'Self Event',
                })
                .set('Authorization', `Bearer mockToken`);

            expect(res.statusCode).toEqual(200);
            expect(res.body.status).toEqual('success');
            expect(res.body.data).toHaveProperty('date', '2024-02-01');
        });

        it('should fail if the plan does not exist', async () => {
            UserPlan.findByPk.mockResolvedValue(null);

            const res = await request(app)
                .put('/api/v1/user-plans/update')
                .query({ id: 1 })
                .send({
                    date: '2024-02-01',
                    time: '14:00',
                    endDate: '2024-02-01',
                    endTime: '16:00',
                    eventType: 'Self Event',
                })
                .set('Authorization', `Bearer mockToken`);

            expect(res.statusCode).toEqual(404);
            expect(res.body.message).toEqual('Plan not found');
        });
    });
});