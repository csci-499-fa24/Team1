const axios = require('axios');
const { Restaurants } = require('../models');

// Helper function to get `placeId` using Google Places API
async function getPlaceIdByName(name, address) {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  
  console.log(`Searching for placeId with name: ${name}, address: ${address}`); // Log the name and address being sent

  try {
    const response = await axios.get(`https://maps.googleapis.com/maps/api/place/findplacefromtext/json`, {
      params: {
        input: `${name}, ${address}`, // Using both name and address for better accuracy
        inputtype: 'textquery',
        fields: 'place_id',
        key: apiKey,
      },
    });

    console.log('Google API Response:', response.data); //Log the full response from Google

    const placeId = response.data.candidates[0]?.place_id; // Extract place_id from API response
    console.log('Found placeId:', placeId); // Log the placeId if found
    return placeId || null;
  } catch (error) {
    console.error('Error fetching placeId:', error);
    return null;
  }
}

exports.getRestaurantHours = async (req, res) => {
  const { camis } = req.query;

  try {
    // Fetch restaurant details using `camis` from the database
    const restaurant = await Restaurants.findOne({ where: { camis } });
    
    if (!restaurant) {
      console.log(`Restaurant not found for camis: ${camis}`); // Log when restaurant is not found
      return res.status(404).json({ error: 'Restaurant not found' });
    }

    const restaurantName = restaurant.dba; 
    const restaurantAddress = `${restaurant.building} ${restaurant.street}, ${restaurant.boro}, NY ${restaurant.zipcode}`;

    console.log(`Restaurant found: ${restaurantName}, Address: ${restaurantAddress}`); // Log the restaurant details

    // Fetch the `placeId` dynamically using restaurant name and address
    const placeId = await getPlaceIdByName(restaurantName, restaurantAddress);

    if (!placeId) {
      console.log(`Failed to find placeId for: ${restaurantName}, ${restaurantAddress}`); // Log when placeId is not found
      return res.status(404).json({ error: 'Failed to find placeId for the restaurant' });
    }

    // Fetch the restaurant details (including opening hours) using the `placeId`
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    const response = await axios.get(`https://maps.googleapis.com/maps/api/place/details/json`, {
      params: {
        place_id: placeId,
        fields: 'name,opening_hours',
        key: apiKey,
      },
    });

    const restaurantDetails = response.data.result;
    if (!restaurantDetails || !restaurantDetails.opening_hours) {
      console.log('No opening hours available for this place'); //Log if hours are not available
      return res.status(404).json({ error: 'No hours available for this place' });
    }

    // Send the hours and name back to the frontend
    res.status(200).json({
      name: restaurantDetails.name,
      hours: restaurantDetails.opening_hours,
    });
  } catch (error) {
    console.error('Error fetching restaurant hours:', error); //Log unexpected errors
    res.status(500).json({ error: 'Failed to retrieve restaurant hours' });
  }
};
