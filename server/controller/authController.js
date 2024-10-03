// authenication
const user = require("../db/models/user");
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
const signup = catchAsync(async (req, res, next) =>{
    const body = req.body;
   
    //invalid user
    //if(!['1'].includes(body.userType)) {
    //    throw new AppError('Invalid user Type', 400);
    //}

    //create new user
    const newUser = await user.create({
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


// login  -wrap with catchAsync error 
const login = catchAsync(async (req, res, next) => {
    const {email, password} = req.body;

    console.log(req.body);

    if(!email || !password) {
       return next(new AppError('Please provide email and password', 400));
    }

    const result = await user.findOne({where: {email}});
    if(!result || !(await bcrypt.compare(password, result.password)) ) {
        return next(new AppError('Incorrect email or password', 401));
    }

    const token =  generateToken({
        id: result.id
    });

    return res.json({
        status: 'success',
        token,
    })
    
});

const authenication =  catchAsync(async(req, res, next) => {
    //1. get the token from headers
    let idToken ='';
    if(req.headers.authorization && 
        req.headers.authorization.startsWith('Bearer')){
            //bearer asdf
            idToken = req.headers.authorization.split(' ')[1];
        }
    if(!idToken){
        return next(new AppError('Please login to get access', 401));
    }

    //2. token verification
    const tokenDetail = jwt.verify(idToken, process.env.JWT_SECRET_KEY)

    //3. get the user detail from db and add to req object
    const freshUser = await user.findByPk(tokenDetail.id)

    if(!freshUser) {
        return next(new AppError('User no longer exists', 400));
    }
    
    req.user = freshUser;
    return next();
})


module.exports = { signup, login, authenication};