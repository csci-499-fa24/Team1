// authenication
const user = require("../models");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const catchAsync = require("../utils/asyncError");
const AppError = require("../utils/appError")


//generate json web token
const generateToken = (payload) => {
    
    return jwt.sign(payload, process.env.JWT_SECRET_KEY, {
        expiresIn: process.env.JWT_EXPIRES_IN
    })
}


// sign up - wrap with catchAsync error 
const signup = catchAsync(async (req, res, next) => {
    const { userName, email, password, confirmPassword } = req.body;

    // Check for missing fields
    if (!userName || !email || !password || !confirmPassword) {
        return next(new AppError('All fields are required', 400));
    }

    // Validate if passwords match
    if (password !== confirmPassword) {
        return next(new AppError('Passwords do not match', 400));
       
    }

    // Email format check with Regular Expression
    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
        return next(new AppError('Invalid email format', 400));
    }

      // Password format check with Regular Expression
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
      
      if (!passwordRegex.test(password)) {
          return next(
              new AppError(
                  'Password must be at least 8 characters long, at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character.',
                  400
              )
          );
      }


    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    try {
        const newUser = await user.User.create({
            userType: 1,
            userName,
            email,
            password: hashedPassword,
        });

        // Check if user creation failed
        if (!newUser) {
            return next(new AppError('Failed to create the user', 400));
        }

        // Prepare the result for response
        const result = newUser.toJSON(); // Convert to JS object instead of model object
        delete result.password; // Remove the password from the response
        delete result.deletedAt; // Remove deletedAt if using paranoid

        result.token = generateToken({ id: result.id });
   
        return res.status(201).json({
            status: 'success',
            data: result,
        });
    } catch (error) {

        if (error.name === 'SequelizeUniqueConstraintError') {
            return next(new AppError('This email is already in use. Please use a different one.', 400));
        }

        if (error.name === 'SequelizeValidationError') {
            const message = error.errors.map(err => err.message).join(', ');
            return next(new AppError(message, 400));
        }

        console.error('Error during user creation:', error);
        return next(new AppError('Something went wrong. Please try again later.', 500));
    
    }
});


// login  -wrap with catchAsync error 
const login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;

    // Check for missing fields
    if (!email || !password) {
        return next(new AppError('Please provide email and password', 400));
    }

    try {
        // Find the user by email
        const result = await user.User.findOne({ where: { email } });

        // Check if user exists and password matches
        if (!result || !(await bcrypt.compare(password, result.password))) {
            return next(new AppError('Incorrect email or password', 401));
        }

        // Generate and return JWT token
        const token = generateToken({ id: result.id });
        return res.json({
            status: 'success',
            token,
        });
    } catch (error) {
        console.error('Error during login:', error); // Log the error for debugging
        return next(new AppError('Something went wrong. Please try again later.', 500));
    }
});


// authenticate user with token
const authentication = catchAsync(async (req, res, next) => {
    // 1. Get the token from headers
    let idToken = '';
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        idToken = req.headers.authorization.split(' ')[1];
    }

    if (!idToken) {
        return next(new AppError('Please login to get access', 401));
    }

    // 2. Token verification
    let tokenDetail;
    try {
        tokenDetail = jwt.verify(idToken, process.env.JWT_SECRET_KEY);
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return next(new AppError('Your token has expired. Please log in again.', 401));
        }
        return next(new AppError('Invalid token. Please log in again.', 401));
    }

    // 3. Get the user details from the database and add to the request object
    try {
        const userDetail = await user.User.findByPk(tokenDetail.id);
        if (!userDetail) {
            return next(new AppError('User not found', 404));
        }
        req.user = userDetail;
        return next();
    } catch (err) {
        console.error('Error during user lookup:', err); 
        return next(new AppError('Something went wrong. Please try again later.', 500));
    }
});


module.exports = { signup, login, authentication};