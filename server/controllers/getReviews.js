const axios = require('axios');
const { Restaurants } = require('../models');
const { getPlaceIdByName } = require('./getRestaurantHours'); 

exports.getRestaurantReviews = async (req, res) => {
  const { camis } = req.query;
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;

  try {
    // Fetch restaurant details from the database using `camis`
    const restaurant = await Restaurants.findOne({ where: { camis } });
    if (!restaurant) {
      console.log(`Restaurant not found for camis: ${camis}`);
      return res.status(404).json({ error: 'Restaurant not found' });
    }

    const restaurantName = restaurant.dba;
    const restaurantAddress = `${restaurant.building} ${restaurant.street}, ${restaurant.boro}, NY ${restaurant.zipcode}`;


    let placeId = restaurant.place_id; 
    if (!placeId) {
      placeId = await getPlaceIdByName(restaurantName, restaurantAddress);
      if (!placeId) {
        return res.status(404).json({ error: 'Failed to find placeId for the restaurant' });
      }
    }

    // Fetch reviews from Google Places API using the `place_id`
    const response = await axios.get(`https://maps.googleapis.com/maps/api/place/details/json`, {
      params: {
        place_id: placeId,
        fields: 'name,rating,reviews,price_level,website',
        key: apiKey,
      },
    });

    const reviews = response.data.result.reviews.map(review => ({
      author_name: review.author_name, // Author of the review
      rating: review.rating, // Rating given by the user
      text: review.text, // The actual review text
      date: new Date(review.time * 1000).toLocaleDateString(), // Formatted review date 
    })) || [];
    res.status(200).json(reviews);
  } catch (error) {
    console.error('Error fetching restaurant reviews:', error);
    res.status(500).json({ error: 'Failed to retrieve restaurant reviews' });
  }
};
