const { Restaurants, UserPlan } = require('../models');
const catchAsync = require('../utils/asyncError');
const AppError = require('../utils/appError');

const addUserPlan = catchAsync(async (req, res, next) => {
    const { camis, longitude, latitude, date, time } = req.body;
    const userId = req.user.id;

    if (!camis || !longitude || !latitude || !date || !time) {
        return next(new AppError('All fields are required', 400));
    }

    const restaurant = await Restaurants.findOne({ where: { camis } });
    if (!restaurant) {
        return next(new AppError('Restaurant not found', 404));
    }

    try {
        const userPlan = await UserPlan.create({
            userId,
            camis,
            longitude,
            latitude,
            date,
            time,
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

module.exports = { addUserPlan };
