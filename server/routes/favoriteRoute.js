const express = require('express');
const { addFavoritePlace, getFavoritePlaces, deleteFavoritePlace, fetchPlaceDetails } = require('../controllers/favoriteController');
const { authentication } = require('../controllers/authController');

const router = express.Router();


// Protect routes with authentication middleware
router.route('/').get(authentication, getFavoritePlaces);          // Get all favorite places
router.route('/add').post(authentication, addFavoritePlace);       // Add a new favorite place
router.route('/remove/:camis').delete(authentication, deleteFavoritePlace);  // Remove a favorite place by ID
router.route('/place-details').get(fetchPlaceDetails);


module.exports = router;