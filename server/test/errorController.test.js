const express = require('express');
const request = require('supertest');
const AppError = require('../utils/appError');
const globalErrorHandler = require('../controllers/errorController');

describe('Global Error Handler', () => {
    let app;

    beforeAll(() => {
        app = express();

        // Middleware to simulate throwing errors
        app.use(express.json());

        app.get('/error/app', (req, res, next) => {
            next(new AppError('This is an operational error', 400));
        });

        app.get('/error/unknown', (req, res, next) => {
            next(new Error('This is an unknown error'));
        });

        app.get('/error/jsonwebtoken', (req, res, next) => {
            const error = new Error('Invalid token');
            error.name = 'JsonWebTokenError';
            next(error);
        });

        app.get('/error/validation', (req, res, next) => {
            const error = new Error('Validation error');
            error.name = 'SequelizeValidationError';
            error.errors = [{ message: 'Validation failed' }];
            next(error);
        });

        app.get('/error/unique', (req, res, next) => {
            const error = new Error('Unique constraint error');
            error.name = 'SequelizeUniqueConstraintError';
            error.errors = [{ message: 'Email already in use' }];
            next(error);
        });

        // Use the global error handler
        app.use(globalErrorHandler);
    });

    describe('Development Environment', () => {
        beforeAll(() => {
            process.env.NODE_ENV = 'development';
        });

        it('should handle AppError and return detailed error response', async () => {
            const res = await request(app).get('/error/app');
            expect(res.statusCode).toBe(400);
            expect(res.body.status).toBe('fail');
            expect(res.body.message).toBe('This is an operational error');
            expect(res.body).toHaveProperty('stack'); // Stack trace is included in development mode
        });

        it('should handle unknown errors and return detailed error response', async () => {
            const res = await request(app).get('/error/unknown');
            expect(res.statusCode).toBe(500);
            expect(res.body.status).toBe('error');
            expect(res.body.message).toBe('This is an unknown error');
            expect(res.body).toHaveProperty('stack'); // Stack trace is included in development mode
        });
    });

    describe('Production Environment', () => {
        beforeAll(() => {
            process.env.NODE_ENV = 'production';
        });

        it('should handle AppError and return sanitized response', async () => {
            const res = await request(app).get('/error/app');
            expect(res.statusCode).toBe(400);
            expect(res.body.status).toBe('fail');
            expect(res.body.message).toBe('This is an operational error');
            expect(res.body).not.toHaveProperty('stack'); // No stack trace in production mode
        });

        it('should handle unknown errors and return generic response', async () => {
            const res = await request(app).get('/error/unknown');
            expect(res.statusCode).toBe(500);
            expect(res.body.status).toBe('error');
            expect(res.body.message).toBe('Something went very wrong');
            expect(res.body).not.toHaveProperty('stack'); // No stack trace in production mode
        });

        it('should handle JsonWebTokenError and return 401 with custom message', async () => {
            const res = await request(app).get('/error/jsonwebtoken');
            expect(res.statusCode).toBe(401);
            expect(res.body.status).toBe('fail');
            expect(res.body.message).toBe('Invalid token');
        });

        it('should handle SequelizeValidationError and return 400 with specific message', async () => {
            const res = await request(app).get('/error/validation');
            expect(res.statusCode).toBe(400);
            expect(res.body.status).toBe('fail');
            expect(res.body.message).toBe('Validation failed');
        });

        it('should handle SequelizeUniqueConstraintError and return 400 with specific message', async () => {
            const res = await request(app).get('/error/unique');
            expect(res.statusCode).toBe(400);
            expect(res.body.status).toBe('fail');
            expect(res.body.message).toBe('Email already in use');
        });
    });
});