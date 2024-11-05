const express = require('express');
const router = express.Router();
const { addUserPlan } = require('../controllers/addPlan')
const { authentication } = require('../controllers/authController');

router.post('/add', authentication, addUserPlan);

module.exports = router;
