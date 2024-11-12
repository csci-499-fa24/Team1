const express = require('express');
const router = express.Router();
const { addUserPlan, getAllUserPlans, deleteUserPlan } = require('../controllers/addPlan')
const { authentication } = require('../controllers/authController');

router.post('/add', authentication, addUserPlan);
router.delete('/remove', authentication, deleteUserPlan);
router.get('/plan-data', authentication, getAllUserPlans);

module.exports = router;
