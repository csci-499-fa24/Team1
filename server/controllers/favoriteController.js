
const { FavoritePlaces, Restaurants, Locations, User } = require('../models');
const catchAsync = require('../utils/asyncError');
const AppError = require('../utils/appError');
const axios = require('axios');

// Add a new favorite place
const addFavoritePlace = catchAsync(async (req, res, next) => {
    const { camis } = req.body;
    const userId = req.user.id;

    // Check if the restaurant exists
    const restaurant = await Restaurants.findOne({ where: { camis } });

    if (!restaurant) {
        return next(new AppError('Restaurant not found', 404));
    }

    // Check if the favorite place already exists
    const existingFavorite = await FavoritePlaces.findOne({ where: { userId, camis } });
    if (existingFavorite) {
        return next(new AppError('Favorite place already exists', 400));
    }

    try {
        // Attempt to create the favorite place
        const favoritePlace = await FavoritePlaces.create({ userId, camis });

        return res.status(201).json({
            status: 'success',
            data: {
                favoritePlace,
            },
        });
    } catch (error) {

        return next(new AppError('Failed to add favorite place', 500));
    }
});



// Get all favorite places for the logged-in user
const getFavoritePlaces = catchAsync(async (req, res, next) => {
    const userId = req.user.id;

    try {
        // Fetch favorite places and include associated restaurant and location details
        const favoritePlaces = await FavoritePlaces.findAll({
            where: { userId },
            include: [
                {
                    model: Restaurants,
                    attributes: ['dba', 'building', 'street', 'zipcode', 'boro'], // Fetch restaurant data
                    include: {
                        model: Locations, // Nested include to fetch location data
                        attributes: ['latitude', 'longitude'],
                    },
                },
            ],
        });

        // Always return an empty array when no favorite places are found
        return res.status(200).json({
            status: 'success',
            data: {
                favoritePlaces: favoritePlaces.length ? favoritePlaces : [], // Return an empty array if no favorites
            },
        });
    } catch (error) {
        console.error('Error fetching favorite places:', error); // Log the error for debugging
        return next(new AppError('Failed to retrieve favorite places', 500)); // Handle the error
    }
});


// Remove a favorite place
const deleteFavoritePlace = catchAsync(async (req, res, next) => {
    const { camis } = req.params;
    const userId = req.user.id;

    try {
        const favoritePlace = await FavoritePlaces.findOne({
            where: { camis, userId },
        });

        if (!favoritePlace) {
            return next(new AppError('Favorite place not found', 404));
        }

        await favoritePlace.destroy();

        return res.status(204).json({
            status: 'success',
            message: 'Favorite place deleted',
        });
    } catch (error) {   
        return next(new AppError('Failed to delete favorite place', 500));
    }

});


//fetch place details
const fetchPlaceDetails = catchAsync(async (req, res, next) => {
    const { camis } = req.query;

    if (!camis) {
        return next(new AppError('Camis is required', 400));
    }

    const apiKey = process.env.GOOGLE_MAPS_API_KEY;

    try {
        // Fetch restaurant details from the database using `camis`
        const restaurant = await Restaurants.findOne({ where: { camis } });
        if (!restaurant) {
            return next(new AppError('Restaurant not found', 404));
        }

        const name = restaurant.dba;
        const address = `${restaurant.building} ${restaurant.street}, ${restaurant.boro}, NY ${restaurant.zipcode}`;

        // Find place by name and address to get the place ID
        const placeResponse = await axios.get(
            'https://maps.googleapis.com/maps/api/place/findplacefromtext/json',
            {
                params: {
                    input: `${name} ${address}`,
                    inputtype: 'textquery',
                    fields: 'place_id',
                    key: apiKey,
                },
            }
        );

        if (placeResponse.data.status !== 'OK' || !placeResponse.data.candidates.length) {
            return next(new AppError('Place not found', 404));
        }

        const placeId = placeResponse.data.candidates[0].place_id;

        // Use place ID to fetch additional details, including photos
        const detailsResponse = await axios.get(
            'https://maps.googleapis.com/maps/api/place/details/json',
            {
                params: {
                    place_id: placeId,
                    key: apiKey,
                    fields: 'name,formatted_address,formatted_phone_number,opening_hours,website,rating,photos',
                },
            }
        );

        if (detailsResponse.data.status !== 'OK') {
            return next(new AppError('Failed to fetch additional details', 500));
        }

        const data = detailsResponse.data.result;

        // If there are photos, get the first photo's URL
        let photoUrl = null;
        if (data.photos && data.photos.length > 0) {
            const photoReference = data.photos[0].photo_reference;
            const photoUrlResponse = `https://maps.googleapis.com/maps/api/place/photo?photo_reference=${photoReference}&key=${apiKey}&maxwidth=400&maxheight=300`;

            try {
                const imageResponse = await axios.get(photoUrlResponse, { responseType: 'arraybuffer' });
                const imageBuffer = Buffer.from(imageResponse.data, 'binary');
                photoUrl = `data:image/jpeg;base64,${imageBuffer.toString('base64')}`;
            } catch (photoError) {
                console.error('Error fetching photo URL:', photoError);
                // Continue without photo URL
            }
        }

        // Format and return the response
        const formattedDetails = {
            restaurant,
            name: data.name,
            address: data.formatted_address,
            hours: data.opening_hours,
            website: data.website,
            rating: data.rating,
            phone: data.formatted_phone_number,
            photoUrl, // Will be `null` if no photo was fetched
        };

        return res.status(200).json({
            status: 'success',
            data: formattedDetails,
        });
    } catch (error) {
        console.error('Error fetching place details:', error);
        return next(new AppError('Failed to fetch place details', 500));
    }
});



module.exports = { addFavoritePlace, getFavoritePlaces, deleteFavoritePlace,  fetchPlaceDetails };
