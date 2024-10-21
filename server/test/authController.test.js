const express = require('express');
const request = require('supertest');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const catchAsync = require('../utils/asyncError');
const AppError = require('../utils/appError');
const globalErrorHandler = require('../controllers/errorController'); // Import the global error handler
const { signup, login, authentication } = require('../controllers/authController');
const { User } = require('../models');
require('dotenv').config({path: `${process.cwd()}/.env`});
const { UniqueConstraintError } = require('sequelize');
jest.mock('../models'); // Mock the User model
jest.mock('bcrypt'); // Mock bcrypt
//jest.mock('jsonwebtoken'); // Mock jsonwebtoken

describe('AuthController', () => {
    let app;
    
    beforeAll(() => {
        app = express();
        app.use(express.json());
        
        // Define the routes within the test app
        app.post('/api/v1/auth/signup', signup);
        app.post('/api/v1/auth/login', login);
        app.get('/api/v1/auth/authentication', authentication, (req, res) => {
            res.status(200).json({ status: 'success', userDetail: req.user });
        });

        // Use the global error handler middleware
        app.use(globalErrorHandler);
    });

    let mockUser;
    
    beforeEach(() => {
        mockUser = {
            id: 1,
            userName: 'testUser',
            email: 'test@example.com',
            password: 'hashedPassword', // Simulate hashed password
            toJSON: function() {
                return {
                    id: this.id,
                    userName: this.userName,
                    email: this.email,
                };
            },
        };
    });

    afterEach(() => {
        jest.clearAllMocks();
    });
    
    
    describe('Signup', () => {
        it('should sign up a new user', async () => {
            User.create.mockResolvedValue(mockUser);

            const signMock = jest.spyOn(jwt, 'sign').mockReturnValue('mockToken');
            const res = await request(app)
                .post('/api/v1/auth/signup')
                .send({
                    userName: 'testUser',
                    email: 'test@example.com',
                    password: 'password123',
                    confirmPassword: 'password123',
                });

            expect(res.statusCode).toEqual(201);
            expect(res.body.status).toEqual('success');
            expect(res.body.data).toHaveProperty('token', 'mockToken'); // Ensure token is checked
            expect(User.create).toHaveBeenCalledWith(expect.objectContaining({
                userName: 'testUser',
                email: 'test@example.com',
                password: expect.any(String), // Password should be hashed

            }));
            signMock.mockRestore(); 
        });

        it('should fail if passwords do not match', async () => {
            const res = await request(app)
                .post('/api/v1/auth/signup')
                .send({
                    userName: 'testUser',
                    email: 'test@example.com',
                    password: 'password123',
                    confirmPassword: 'differentPassword',
                });

            expect(res.statusCode).toEqual(400);
            expect(res.body.message).toEqual('Passwords do not match');
        });

        it('should fail if required fields are missing', async () => {
            const res = await request(app)
                .post('/api/v1/auth/signup')
                .send({
                    userName: 'testUser',
                    email: 'test@example.com',
                    // password and confirmPassword are missing
                });

            expect(res.statusCode).toEqual(400);
            expect(res.body.message).toEqual('All fields are required');
        });
    });

    describe('Login', () => {
        it('should log in a user', async () => {
            User.findOne.mockResolvedValue(mockUser);
            bcrypt.compare.mockResolvedValue(true);
         
           const signMock = jest.spyOn(jwt, 'sign').mockReturnValue('mockToken');

            const res = await request(app)
                .post('/api/v1/auth/login')
                .send({
                    email: 'test@example.com',
                    password: 'password123',
                });

            expect(res.statusCode).toEqual(200);
            expect(res.body.status).toEqual('success');
            expect(res.body).toHaveProperty('token', 'mockToken');

            signMock.mockRestore();
        });

        it('should fail if email or password is missing', async () => {
            const res = await request(app)
                .post('/api/v1/auth/login')
                .send({
                    email: 'test@example.com',
                    // password is missing
                });

            expect(res.statusCode).toEqual(400);
            expect(res.body.message).toEqual('Please provide email and password');
        });

        it('should fail if user is not found', async () => {
            User.findOne.mockResolvedValue(null); // No user found

            const res = await request(app)
                .post('/api/v1/auth/login')
                .send({
                    email: 'test@example.com',
                    password: 'password123',
                });

            expect(res.statusCode).toEqual(401);
            expect(res.body.message).toEqual('Incorrect email or password');
        });

        it('should fail if password is incorrect', async () => {
            User.findOne.mockResolvedValue(mockUser);
            bcrypt.compare.mockResolvedValue(false); // Simulate incorrect password

            const res = await request(app)
                .post('/api/v1/auth/login')
                .send({
                    email: 'test@example.com',
                    password: 'wrongPassword',
                });

            expect(res.statusCode).toEqual(401);
            expect(res.body.message).toEqual('Incorrect email or password');
        });
    });

    describe('Authentication', () => {
      

        beforeEach(() => {
            jest.restoreAllMocks();
        });

        it('should authenticate a user with a valid token', async () => {
            const token = jwt.sign({id: mockUser.id }, process.env.JWT_SECRET_KEY ||'default-secret-key'); // Ensure secret key is correct
            User.findByPk.mockResolvedValue(mockUser); // Mock finding the user
        
            const res = await request(app)
                .get('/api/v1/auth/authentication')
                .set('Authorization', `Bearer ${token}`);


            expect(res.statusCode).toEqual(200);
            expect(res.body.status).toEqual('success');
            expect(res.body.userDetail).toEqual({
                id: mockUser.id,
                userName: mockUser.userName,
                email: mockUser.email
            });
        });
        
        it('should fail if no token is provided', async () => {
            const res = await request(app).get('/api/v1/auth/authentication');

            expect(res.statusCode).toEqual(401);
            expect(res.body.message).toEqual('Please login to get access');
        });

        it('should fail if the token is invalid', async () => {
            const invalidToken = 'invalidToken';

            const res = await request(app)
                .get('/api/v1/auth/authentication')
                .set('Authorization', `Bearer ${invalidToken}`);

            expect(res.statusCode).toEqual(401);
            expect(res.body.message).toEqual('Invalid token. Please log in again.');
        });

        

        it('should fail if the user does not exist', async () => {
            const token = jwt.sign({ id: 999 }, process.env.JWT_SECRET_KEY ||'default-secret-key'); // Non-existent user ID
            User.findByPk.mockResolvedValue(null); // Simulate user not found

            const res = await request(app)
                .get('/api/v1/auth/authentication')
                .set('Authorization', `Bearer ${token}`);
          
            expect(res.statusCode).toEqual(400);
            expect(res.body.message).toEqual('User no longer exists');
        });
    });
});

