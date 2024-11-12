const { Restaurants, UserPlan } = require('../models');
const catchAsync = require('../utils/asyncError');
const AppError = require('../utils/appError');

const addUserPlan = catchAsync(async (req, res, next) => {
    const { camis, longitude, latitude, date, time, eventName, endDate, endTime, eventType } = req.body;
    const userId = req.user.id;
    if(eventType === 'Self Event') {
        if (!camis || !longitude || !latitude || !date || !time) {
            return next(new AppError('All fields are required', 400));
        }
        
        const restaurant = await Restaurants.findOne({ where: { camis } });
        if (!restaurant) {
            return next(new AppError('Restaurant not found', 404));
        }
    }
    try {
        const userPlan = await UserPlan.create({
            userId,
            camis,
            longitude,
            latitude,
            date,
            time,
            eventName,
            endDate,
            endTime,
            eventType,
        });

        return res.status(201).json({
            status: 'success',
            data: {
                userPlan,
            },
        });
    } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
            const message = error.errors.map(err => err.message).join(', ');
            return next(new AppError(message, 400));
        }

        console.error('Error creating user plan:', error);
        return next(new AppError('Failed to add user plan', 500));
    }
});

const deleteUserPlan = catchAsync(async (req, res, next ) => {
    const { id } = req.query;
    if (!id) {
        return next(new AppError('No plan ID', 400));
    }

    const deletedUserPlan = await UserPlan.findByPk(id);
    if (!deletedUserPlan) {
        return next(new AppError('No plan with ID', 400));
    }

    try {
        await deletedUserPlan.destroy();

        return res.status(201).json({
            status: 'success',
            data: null,
        });
    } catch (error) {
        console.error('Error deleteing user plan:', error);
        return next(new AppError('Failed to add user plan', 500));
    }

});

const getAllUserPlans = catchAsync(async (req, res, next) => {
    const userId = req.user.id;

    try {
        const userPlans = await UserPlan.findAll({
            where: { userId },
            attributes: ['id', 'userId', 'camis', 'longitude', 'latitude', 'date', 'time', 'endDate', 'endTime', 'eventName', 'eventType'],
            include: {
                model: Restaurants,
                attributes: ['dba'],
                required: false,
            },
        });

        return res.status(200).json({
            status: 'success',
            data: {
                userPlans,
            },
        });
    } catch (error) {
        console.error('Error retrieving user plans:', error);
        return next(new AppError('Failed to retrieve user plans', 500));
    }
});

module.exports = { addUserPlan, getAllUserPlans, deleteUserPlan }
