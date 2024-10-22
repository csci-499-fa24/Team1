//auth routes

const { signup, login, authentication} = require('../controllers/authController');


const router = require('express').Router();

router.route('/signup').post(signup);

router.route('/login').post(login);


router.route('/authentication').get(authentication, (req, res) => {
    return res.status(200).json({
        status: 'success',
        userDetail: req.user, // Access user details set by the authentication middleware
    });
});


module.exports = router;