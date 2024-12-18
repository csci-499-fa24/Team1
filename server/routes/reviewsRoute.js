const express = require('express');
const axios = require('axios');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { authentication } = require('../controllers/authController');

router.get('/reviews/:placeId', async (req, res) => {
    const { placeId } = req.params;
  
    if (!placeId || placeId === 'undefined') {
      return res.status(400).json({ error: 'Invalid place ID' });
    }
  
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAP_API_KEY;
  
    try {
      const response = await axios.get(`https://maps.googleapis.com/maps/api/place/details/json`, {
        params: {
          place_id: placeId,
          fields: 'name,rating,reviews',
          key: apiKey,
        },
      });
  
      res.status(200).json(response.data.result.reviews || []);
    } catch (error) {
      console.error('Error fetching reviews:', error.message);
      res.status(500).json({ error: 'Failed to retrieve reviews' });
    }
  });
  
// Route for managing user-created reviews
router.post('/', authentication, reviewController.addReview); // Add a review
router.put('/:id', authentication, reviewController.editReview); // Edit a review
router.delete('/:id', authentication, reviewController.deleteReview); // Delete a review
router.get('/:id', reviewController.getReviews); // Get reviews by camis

module.exports = router;
