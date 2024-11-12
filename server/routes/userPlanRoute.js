const express = require('express');
const router = express.Router();
const { addUserPlan, getAllUserPlans } = require('../controllers/addPlan')
const { authentication } = require('../controllers/authController');

router.post('/add', authentication, addUserPlan);
router.get('/plan-data', authentication, getAllUserPlans);

module.exports = router;
