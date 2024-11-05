
const express = require('express');
const request = require('supertest');
const { addFavoritePlace, getFavoritePlaces, deleteFavoritePlace, fetchPlaceDetails } = require('../controllers/favoriteController');
const { authentication } = require('../controllers/authController');
const globalErrorHandler = require('../controllers/errorController');
const { FavoritePlaces, Restaurants, Locations, User } = require('../models');
const jwt = require('jsonwebtoken');
const axios = require('axios');

jest.mock('../models');
jest.mock('axios');
jest.mock('jsonwebtoken');

describe('FavoriteController', () => {
    let app;

    beforeAll(() => {
        app = express();
        app.use(express.json());

        // Define the routes within the test app
        app.get('/api/v1/favorites', authentication, getFavoritePlaces);
        app.post('/api/v1/favorites/add', authentication, addFavoritePlace);
        app.delete('/api/v1/favorites/remove/:camis', authentication, deleteFavoritePlace);
        app.get('/api/v1/fetch-place-details', fetchPlaceDetails);

        // Use the error handler
        app.use(globalErrorHandler);
    });

    let mockUser;
    let mockRestaurant;
    let mockFavoritePlace;

    beforeEach(() => {
        mockUser = {
            id: 1,
            userName: 'testUser',
            email: 'test@example.com',
            password: 'password123',
            toJSON: function() {
                return this;
            }
        };

        mockRestaurant = {
            camis: '123456',
            dba: 'Test Restaurant',
            building: '123',
            street: 'Main St',
            boro: 'Brooklyn',
            zipcode: '11201'
        };

        mockFavoritePlace = {
            id: 1,
            userId: mockUser.id,
            camis: mockRestaurant.camis,
            destroy: jest.fn(),
            toJSON: function() {
                return this;
            }
        };
        
        User.findByPk.mockResolvedValue(mockUser);
        jwt.verify.mockReturnValue({ id: mockUser.id });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('Add Favorite Place', () => {
        it('should add a favorite place', async () => {
            Restaurants.findOne.mockResolvedValue(mockRestaurant);
            FavoritePlaces.create.mockResolvedValue(mockFavoritePlace);
            
            const res = await request(app)
                .post('/api/v1/favorites/add')
                .set('Authorization', `Bearer mockToken`)
                .send({ camis: mockRestaurant.camis });

            expect(res.statusCode).toEqual(201);
            expect(res.body.status).toEqual('success');
            expect(res.body.data).toHaveProperty('favoritePlace');
        });

        it('should fail if the restaurant is not found', async () => {
            Restaurants.findOne.mockResolvedValue(null);

            const res = await request(app)
                .post('/api/v1/favorites/add')
                .set('Authorization', `Bearer mockToken`)
                .send({ camis: mockRestaurant.camis });

            expect(res.statusCode).toEqual(404);
            expect(res.body.message).toEqual('Restaurant not found');
        });
    });

    describe('Get Favorite Places', () => {
        it('should get all favorite places for the logged-in user', async () => {
            FavoritePlaces.findAll.mockResolvedValue([mockFavoritePlace]);

            const res = await request(app)
                .get('/api/v1/favorites')
                .set('Authorization', `Bearer mockToken`);

            expect(res.statusCode).toEqual(200);
            expect(res.body.status).toEqual('success');
            expect(res.body.data.favoritePlaces).toHaveLength(1);
        });

        it('should return error if fetching favorite places fails', async () => {
          FavoritePlaces.findAll.mockRejectedValue(new Error('Failed to retrieve favorite places'));
  
          const res = await request(app)
              .get('/api/v1/favorites')
              .set('Authorization', `Bearer mockToken`);
  
          expect(res.statusCode).toEqual(500);
          expect(res.body.message).toEqual('Failed to retrieve favorite places'); // Ensure this matches the error
        });
    });

    describe('Delete Favorite Place', () => {
        it('should delete a favorite place', async () => {
            FavoritePlaces.findOne.mockResolvedValue(mockFavoritePlace);

            const res = await request(app)
                .delete(`/api/v1/favorites/remove/${mockRestaurant.camis}`)
                .set('Authorization', `Bearer mockToken`);

            expect(res.statusCode).toEqual(204);
        });

        it('should fail if the favorite place is not found', async () => {
            FavoritePlaces.findOne.mockResolvedValue(null);

            const res = await request(app)
                .delete(`/api/v1/favorites/remove/${mockRestaurant.camis}`)
                .set('Authorization', `Bearer mockToken`);

            expect(res.statusCode).toEqual(404);
            expect(res.body.message).toEqual('Favorite place not found');
        });
    });

    describe('Fetch Place Details', () => {
        it('should fetch place details', async () => {
            Restaurants.findOne.mockResolvedValue(mockRestaurant);
            const mockAxiosResponse = {
                data: {
                    status: 'OK',
                    candidates: [{ place_id: 'mockPlaceId' }],
                    result: {
                        name: 'Test Restaurant',
                        formatted_address: '123 Main St, Brooklyn, NY 11201',
                        formatted_phone_number: '123-456-7890',
                        opening_hours: { weekday_text: ['Mon-Sun 10am-10pm'] },
                        website: 'http://testrestaurant.com',
                        rating: 4.5,
                        photos: [{ photo_reference: 'mockPhotoReference' }]
                    }
                }
            };
            axios.get.mockResolvedValue(mockAxiosResponse);

            const res = await request(app)
                .get(`/api/v1/fetch-place-details?camis=${mockRestaurant.camis}`)
                .set('Authorization', `Bearer mockToken`);

            expect(res.statusCode).toEqual(200);
            expect(res.body.status).toEqual('success');
            expect(res.body.data).toHaveProperty('name', 'Test Restaurant');
        });

        it('should fail if the restaurant is not found', async () => {
            Restaurants.findOne.mockResolvedValue(null);

            const res = await request(app)
                .get(`/api/v1/fetch-place-details?camis=${mockRestaurant.camis}`)
                .set('Authorization', `Bearer mockToken`);

            expect(res.statusCode).toEqual(404);
            expect(res.body.message).toEqual('Restaurant not found');
        });

        it('should return error if fetching place details fails', async () => {
          Restaurants.findOne.mockResolvedValue(mockRestaurant);
          axios.get.mockRejectedValue(new Error('Failed to fetch place details'));
  
          const res = await request(app)
              .get(`/api/v1/fetch-place-details?camis=${mockRestaurant.camis}`)
              .set('Authorization', `Bearer mockToken`);
  
          expect(res.statusCode).toEqual(500);
          expect(res.body.message).toEqual('Failed to fetch place details'); // Ensure this matches the error
        });
    });
});
