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
            const token = jwt.sign({id: mockUser.id }, process.env.JWT_SECRET_KEY); // Ensure secret key is correct
            User.findByPk.mockResolvedValue(mockUser); // Mock finding the user
            console.log(process.env.JWT_SECRET_KEY);
            console.log(token);
            console.log('Generated Token for Testing:', token); // Log the generated token
            const res = await request(app)
                .get('/api/v1/auth/authentication')
                .set('Authorization', `Bearer ${token}`);

            console.log('Response Body:', res.body); // Log the response body

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
            console.log('Sending Invalid Token:', invalidToken); // Log the invalid token

            const res = await request(app)
                .get('/api/v1/auth/authentication')
                .set('Authorization', `Bearer ${invalidToken}`);

                console.log('Response Body for Invalid Token:', res.body); // Log the response body
            expect(res.statusCode).toEqual(401);
            expect(res.body.message).toEqual('Invalid token. Please log in again.');
        });

        

        it('should fail if the user does not exist', async () => {
            const token = jwt.sign({ id: 999 }, process.env.JWT_SECRET_KEY); // Non-existent user ID
            User.findByPk.mockResolvedValue(null); // Simulate user not found

            const res = await request(app)
                .get('/api/v1/auth/authentication')
                .set('Authorization', `Bearer ${token}`);
            
                console.log(res.body); // Debugging
            expect(res.statusCode).toEqual(400);
            expect(res.body.message).toEqual('User no longer exists');
        });
    });
});






/*
const { signup, login, authentication } = require('../controllers/authController');
const user = require('../models');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const AppError = require('../utils/appError');

// Mock necessary modules
jest.mock('../models');
jest.mock('jsonwebtoken');
jest.mock('bcrypt');
jest.mock('../utils/appError');
jest.unmock('../utils/appError');  // Adjust the path to your `AppError`

describe('Auth Controller', () => {
    // Common mock response object
    let res;
    let next;

    beforeEach(() => {
        res = {
            status: jest.fn(() => res),
            json: jest.fn(),
        };
        next = jest.fn();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    // Test signup
    describe('signup', () => {
        it('should create a new user and return token', async () => {
            const req = {
                body: {
                    userName: 'testUser',
                    email: 'test@example.com',
                    password: 'password123',
                    confirmPassword: 'password123',
                }
            };

            const newUser = {
                id: 1,
                userName: 'testUser',
                email: 'test@example.com',
                toJSON: jest.fn(() => ({
                    id: 1,
                    userName: 'testUser',
                    email: 'test@example.com',
                })),
            };

            // Mock database create and JWT sign
            user.User.create.mockResolvedValue(newUser);
            jwt.sign.mockReturnValue('mockToken');

            await signup(req, res, next);

            expect(user.User.create).toHaveBeenCalledWith({
                userType: 1,
                userName: req.body.userName,
                email: req.body.email,
                password: req.body.password,
                confirmPassword: req.body.confirmPassword,
            });
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({
                status: 'success',
                data: expect.objectContaining({
                    id: 1,
                    userName: 'testUser',
                    token: 'mockToken',
                }),
            });
        });

        it('should handle error when user creation fails', async () => {
            const req = {
                body: {
                    userName: 'testUser',
                    email: 'test@example.com',
                    password: 'password123',
                    confirmPassword: 'password123',
                }
            };
        
            user.User.create.mockResolvedValue(null); // Simulate user creation failure
        
            await signup(req, res, next);
        
            // Check that next was called with an instance of AppError
            expect(next).toHaveBeenCalledWith(expect.any(AppError));
        
            // Verify that the error message and status code are correct
            const errorInstance = next.mock.calls[0][0];  // The first argument passed to next
            expect(errorInstance.message).toBe('Failed to create the user');
            expect(errorInstance.statusCode).toBe(400);
        });
    });

    
    // Test login
    describe('login', () => {
        it('should login successfully and return token', async () => {
            const req = {
                body: {
                    email: 'test@example.com',
                    password: 'password123',
                }
            };

            // Hash the password to simulate the stored user password
            const hashedPassword = await bcrypt.hash('password123', 10); // Use bcrypt to hash

            const userMock = {
                id: 1,
                email: 'test@example.com',
                password: hashedPassword,
            };

            // Mock database query, bcrypt comparison, and JWT sign
            user.User.findOne.mockResolvedValue(userMock);
            bcrypt.compare.mockResolvedValue(true);
            jwt.sign.mockReturnValue('mockToken');

            await login(req, res, next);

            console.log('Res JSON calls:', res.json.mock.calls);

            expect(user.User.findOne).toHaveBeenCalledWith({ where: { email: req.body.email } });
            expect(bcrypt.compare).toHaveBeenCalledWith(req.body.password, userMock.password);
            expect(res.json).toHaveBeenCalledWith({
                status: 'success',
                token: 'mockToken',
            });
        });

        it('should return error for incorrect email or password', async () => {
            const req = {
                body: {
                    email: 'test@example.com',
                    password: 'wrongPassword',
                }
            };

            const userMock = {
                id: 1,
                email: 'test@example.com',
                password: 'hashedPassword',
            };

            user.User.findOne.mockResolvedValue(userMock);
            bcrypt.compare.mockResolvedValue(false); // Simulate incorrect password

            await login(req, res, next);
            console.log('Next calls:', next.mock.calls);

            expect(next).toHaveBeenCalledWith(new AppError('Incorrect email or password', 401));
        });

        it('should return error if email or password is missing', async () => {
            const req = {
                body: {},
            };

            await login(req, res, next);

            expect(next).toHaveBeenCalledWith(new AppError('Please provide email and password', 400));
        });
    });

    
    

    // Test authentication middleware
    describe('authentication', () => {
        it('should authenticate user with valid token', async () => {
            const req = {
                headers: {
                    authorization: 'Bearer mockToken',
                }
            };

            const tokenPayload = { id: 1 };
            const userMock = { id: 1, userName: 'testUser' };

            // Mock token verification and database user retrieval
            jwt.verify.mockReturnValue(tokenPayload);
            user.User.findByPk.mockResolvedValue(userMock);

            await authentication(req, res, next);

            expect(jwt.verify).toHaveBeenCalledWith('mockToken', process.env.JWT_SECRET_KEY);
            expect(user.User.findByPk).toHaveBeenCalledWith(tokenPayload.id);
            expect(req.user).toEqual(userMock);
            expect(next).toHaveBeenCalled();
        });

        it('should return error for invalid or expired token', async () => {
            const req = {
                headers: {
                    authorization: 'Bearer invalidToken',
                }
            };

            jwt.verify.mockImplementation(() => {
                throw new Error();
            });

            await authentication(req, res, next);

            expect(next).toHaveBeenCalledWith(new AppError('Invalid token. Please log in again.', 401));
        });

        it('should return error if user does not exist', async () => {
            const req = {
                headers: {
                    authorization: 'Bearer mockToken',
                }
            };

            const tokenPayload = { id: 1 };

            jwt.verify.mockReturnValue(tokenPayload);
            user.User.findByPk.mockResolvedValue(null); // Simulate no user found

            await authentication(req, res, next);

            expect(next).toHaveBeenCalledWith(new AppError('User no longer exists', 400));
        });
    });
});

*/