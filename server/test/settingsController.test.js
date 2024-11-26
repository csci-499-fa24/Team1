const express = require('express');
const request = require('supertest');
const { getUserInfo, updateUserInfo } = require('../controllers/settingsController');
const { authentication } = require('../controllers/authController');
const globalErrorHandler = require('../controllers/errorController');
const { User } = require('../models');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

jest.mock('../models');
jest.mock('jsonwebtoken');
jest.mock('bcrypt');

describe('SettingsController', () => {
    let app;

    beforeAll(() => {
        app = express();
        app.use(express.json());

        // Define routes
        app.get('/api/v1/settings/getInfo', authentication, getUserInfo);
        app.patch('/api/v1/settings/updateInfo', authentication, updateUserInfo);

        // Use the error handler
        app.use(globalErrorHandler);
    });

    let mockUser;

    beforeEach(() => {
        mockUser = {
            id: 1,
            email: 'test@example.com',
            userName: 'testUser',
            userType: 'regular',
            password: 'hashedPassword123',
            toJSON: function () {
                return this;
            }
        };

        User.findByPk.mockResolvedValue(mockUser);
        jwt.verify.mockReturnValue({ id: mockUser.id });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('Get User Info', () => {
        it('should return user information', async () => {
            const res = await request(app)
                .get('/api/v1/settings/getInfo')
                .set('Authorization', 'Bearer mockToken');

            expect(res.statusCode).toEqual(200);
            expect(res.body.status).toEqual('success');
            expect(res.body.data.user).toHaveProperty('userName', mockUser.userName);
            expect(res.body.data.user).toHaveProperty('email', mockUser.email);
            expect(res.body.data.user).toHaveProperty('userType', mockUser.userType);
        });

        it('should return 404 if user is not found', async () => {
            User.findByPk.mockResolvedValue(null);

            const res = await request(app)
                .get('/api/v1/settings/getInfo')
                .set('Authorization', 'Bearer mockToken');

            expect(res.statusCode).toEqual(404);
            expect(res.body.message).toEqual('User not found');
        });
    });

    describe('Update User Info', () => {
        it('should update user information', async () => {
            User.update.mockResolvedValue([1, [mockUser]]);

            const res = await request(app)
                .patch('/api/v1/settings/updateInfo')
                .set('Authorization', 'Bearer mockToken')
                .send({ email: 'updated@example.com', userName: 'updatedUser' });

            expect(res.statusCode).toEqual(200);
            expect(res.body.status).toEqual('success');
            expect(res.body.data.user).toHaveProperty('userName', mockUser.userName);
            expect(res.body.data.user).toHaveProperty('email', mockUser.email);
        });

        it('should hash password if provided and update user information', async () => {
            const newPassword = 'newPassword123!';
            const hashedPassword = 'hashedNewPassword123!';
            bcrypt.hash.mockResolvedValue(hashedPassword);
            User.update.mockResolvedValue([1, [mockUser]]);

            const res = await request(app)
                .patch('/api/v1/settings/updateInfo')
                .set('Authorization', 'Bearer mockToken')
                .send({ password: newPassword, confirmPassword: newPassword });

            expect(bcrypt.hash).toHaveBeenCalledWith(newPassword, 10);
            expect(res.statusCode).toEqual(200);
            expect(res.body.status).toEqual('success');
            expect(res.body.data.user).not.toHaveProperty('password');
        });

        it('should return 400 if no update fields are provided', async () => {
            const res = await request(app)
                .patch('/api/v1/settings/updateInfo')
                .set('Authorization', 'Bearer mockToken')
                .send({});

            expect(res.statusCode).toEqual(400);
            expect(res.body.message).toEqual('At least one field is required to update');
        });

        it('should return 400 if passwords do not match', async () => {
            const res = await request(app)
                .patch('/api/v1/settings/updateInfo')
                .set('Authorization', 'Bearer mockToken')
                .send({ password: 'password123', confirmPassword: 'differentPassword123' });

            expect(res.statusCode).toEqual(400);
            expect(res.body.message).toEqual('Passwords do not match');
        });

        it('should return 400 for invalid email format', async () => {
            const res = await request(app)
                .patch('/api/v1/settings/updateInfo')
                .set('Authorization', 'Bearer mockToken')
                .send({ email: 'invalid-email-format' });

            expect(res.statusCode).toEqual(400);
            expect(res.body.message).toEqual('Invalid email format');
        });

        it('should return 400 if update fails (e.g., no rows updated)', async () => {
            User.update.mockResolvedValue([0, []]);

            const res = await request(app)
                .patch('/api/v1/settings/updateInfo')
                .set('Authorization', 'Bearer mockToken')
                .send({ email: 'unchanged@example.com' });

            expect(res.statusCode).toEqual(400);
            expect(res.body.message).toEqual('Failed to update user information');
        });

        it('should return 500 if an unexpected error occurs during update', async () => {
            User.update.mockRejectedValue(new Error('Database error'));

            const res = await request(app)
                .patch('/api/v1/settings/updateInfo')
                .set('Authorization', 'Bearer mockToken')
                .send({ userName: 'errorUpdate' });

            expect(res.statusCode).toEqual(500);
            expect(res.body.message).toEqual(
                'An unexpected error occurred while updating user information'
            );
        });
    });
});