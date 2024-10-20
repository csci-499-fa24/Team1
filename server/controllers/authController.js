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
//const signup = async (req, res, next) => {
    const { userName, email, password, confirmPassword } = req.body;


    // Check for missing fields
    if (!userName || !email || !password || !confirmPassword) {
        return next(new AppError('All fields are required', 400));
    }

    // Validate if passwords match
    if (password !== confirmPassword) {
        return next(new AppError('Passwords do not match', 400));
       
    }

    // Create new user
    try {
        const newUser = await user.User.create({
            userType: 1,
            userName,
            email,
            password, // confirmPassword is not passed here
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
       
        console.error('Error during user creation:', error); // Log the error
        return next(new AppError('Failed to create the user', 500));
    }
});

/*
// sign up - wrap with catchAsync error 
const signup = catchAsync(async (req, res, next) =>{
//const signup = async (req, res, next) =>{
    const body = req.body;

    //create new user
    const newUser = await user.User.create({
        userType : 1,
        userName: body.userName,
        email: body.email,
        password: body.password,
        confirmPassword: body.confirmPassword,
    });

     //not new user
     if(!newUser) {
        return next(new AppError('Failed to create the user', 400));
    }

    //delete password and send token to user
    const result = newUser.toJSON();   //convert to js object instead of model object
    delete result.password;
    delete result.deletedAt;

    result.token = generateToken({
        id: result.id
    })

    return res.status(201).json({
        status: 'success',
        data: result,
    });
});

*/

// login  -wrap with catchAsync error 
const login = catchAsync(async (req, res, next) => {
//const login = async (req, res, next) => {
    const {email, password} = req.body;

    //console.log(req.body);
    console.log('Login attempt with:', { email, password });

    if(!email || !password) {
        console.log('Missing email or password');
       return next(new AppError('Please provide email and password', 400));
    }

    const result = await user.User.findOne({where: {email}});

    console.log('User found:', result);  // Debugging

    if(!result || !(await bcrypt.compare(password, result.password)) ) {
        console.log('User not found');
        return next(new AppError('Incorrect email or password', 401));
    }

    const passwordMatch = await bcrypt.compare(password, result.password);
    console.log('Password match:', passwordMatch);  // Debugging

    if (!passwordMatch) {
        console.log('Incorrect password');
        return next(new AppError('Incorrect email or password', 401));
    }

    const token =  generateToken({
        id: result.id
    }); 

     
    console.log('Generated token:', token);  // Debugging
    return res.json({
        status: 'success',
        token,
    })
    
});




 // authenticate user with token
const authentication =  catchAsync(async(req, res, next) => {

    //1. get the token from headers
    let idToken ='';
    if(req.headers.authorization && 
        req.headers.authorization.startsWith('Bearer')){

            idToken = req.headers.authorization.split(' ')[1];
        }

        console.log('Authorization Header:', req.headers.authorization); // Log the entire header
        console.log('Extracted Token:', idToken); // Log the extracted token
    if(!idToken){
        return next(new AppError('Please login to get access', 401));
    }
 
    //2. token verification
    console.log('JWT_SECRET_KEY:', process.env.JWT_SECRET_KEY);
     let tokenDetail;
    try {
        tokenDetail = jwt.verify(idToken, process.env.JWT_SECRET_KEY);
      //const tokenDetail = jwt.verify(idToken);
        console.log('Decoded Token Detail:', tokenDetail); // Log the decoded token details
    } catch (err) {
       // console.error('Token Verification Error:', err); // Log the error
        return next(new AppError('Invalid token. Please log in again.', 401));
    }
    
    //3. get the user detail from db and add to req object
   // console.log('User Detail Retrieved:'); // Log the user details from the DB
    const userDetail = await user.User.findByPk(tokenDetail.id);
    console.log('User Detail Retrieved:', userDetail); // Log the user details from the DB

    if(!userDetail) {
        return next(new AppError('User no longer exists', 400));
    }
    
     req.user = userDetail;
    return next();  
   
});


module.exports = { signup, login, authentication};

