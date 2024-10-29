const axios = require('axios');

// Fetch reviews based on place ID
async function fetchReviewsByPlaceId(placeId) {
  try {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAP_API_KEY; // Uses the public API key from env
    const url = `https://maps.googleapis.com/maps/api/place/details/json`;

    const response = await axios.get(url, {
      params: {
        place_id: placeId,
        fields: 'name,rating,reviews',
        key: apiKey,
      },
    });

    const reviews = response.data.result.reviews || [];
    return reviews.map((review) => ({
      author: review.author_name,
      rating: review.rating,
      text: review.text,
      time: review.relative_time_description,
    }));
  } catch (error) {
    console.error('Error fetching reviews:', error.message);
    return [];
  }
}

module.exports = { fetchReviewsByPlaceId };
