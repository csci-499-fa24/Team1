//auth routes

const { signup, login } = require('../controllers/authController');


const router = require('express').Router();

router.route('/signup').post(signup);

router.route('/login').post(login);



module.exports = router;