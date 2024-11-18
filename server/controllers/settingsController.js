const user = require("../models");
const bcrypt = require("bcrypt");
const catchAsync = require("../utils/asyncError");
const AppError = require("../utils/appError");

// Get user information
const getUserInfo = catchAsync(async (req, res, next) => {
    const userId = req.user.id;

    const userDetail = await user.User.findByPk(userId, {
        attributes: ["id", "email", "userName", "userType"], // Fetch necessary fields
    });

    if (!userDetail) {
        return next(new AppError("User not found", 404));
    }

    res.status(200).json({
        status: "success",
        data: {
            user: {
                userName: userDetail.userName,
                email: userDetail.email,
                userType: userDetail.userType, // Assuming userType is relevant
            },
        },
    });
});


const updateUserInfo = catchAsync(async (req, res, next) => {
    const userId = req.user.id; // Assumes user ID is available in the request object
    const { email, userName, password, confirmPassword } = req.body;

    // Check if at least one field is provided for update
    if (!email && !userName && !password) {
        return next(new AppError("At least one field is required to update", 400));
    }

    // Email validation (regex-based)
    if (email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return next(new AppError("Invalid email format", 400));
        }
    }

    // Password-specific validations
    if (password) {
        if (!confirmPassword) {
            return next(new AppError("Confirm password is required", 400));
        }
        if (password !== confirmPassword) {
            return next(new AppError("Passwords do not match", 400));
        }
        if (password.length < 8) {
            return next(new AppError("Password must be at least 8 characters long", 400));
        }
    }

    // Prepare fields to update
    const updatedFields = {};
    if (email) updatedFields.email = email;
    if (userName) updatedFields.userName = userName;

    // Hash password if it's being updated
    if (password) {
        updatedFields.password = await bcrypt.hash(password, 10);
    }

    try {
        // Update user in the database
        const [updatedRows, [updatedUser]] = await user.User.update(updatedFields, {
            where: { id: userId },
            returning: true, // Returns the updated user data
            validate: true,  // Enforce Sequelize model validations
        });

        // Check if any rows were updated
        if (updatedRows === 0) {
            return next(new AppError("Failed to update user information", 400));
        }

        // Format the response without including sensitive information like the password
        const userResponse = updatedUser.toJSON();
        delete userResponse.password;

        res.status(200).json({
            status: "success",
            data: {
                user: {
                    userName: userResponse.userName,
                    email: userResponse.email,
                    userType: userResponse.userType, // Include userType if it's part of your model
                },
            },
        });
    } catch (error) {
        // Handle Sequelize-specific validation and unique constraint errors
        if (
            error.name === "SequelizeValidationError" ||
            error.name === "SequelizeUniqueConstraintError"
        ) {
            // Extract error messages from Sequelize
            const message = error.errors.map((err) => err.message).join(", ");
            return next(new AppError(message, 400));
        }

        // Log and handle unexpected errors
        console.error("Error during user update:", error);
        return next(new AppError("An unexpected error occurred while updating user information", 500));
    }
});

module.exports = { getUserInfo, updateUserInfo };