//auth routes

const { signup, login, authenication, checkToken } = require('../controllers/authController');


const router = require('express').Router();

router.route('/signup').post(signup);

router.route('/login').post(login);

router.route('/authentication').get(authenication);

router.route('/check-token').get(checkToken);

module.exports = router;