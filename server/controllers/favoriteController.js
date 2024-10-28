
const { FavoritePlaces, Restaurants, Locations, User } = require('../models');
const catchAsync = require('../utils/asyncError');
const AppError = require('../utils/appError');
const axios = require('axios');

// Add a new favorite place
const addFavoritePlace = catchAsync(async (req, res, next) => {
    const { camis } = req.body; // The camis (restaurant ID) is passed in the request body
    const userId = req.user.id; // Assuming user is authenticated and userId is available

    // Check if the restaurant with the provided camis exists
    const restaurant = await Restaurants.findOne({ where: { camis } });

    if (!restaurant) {
        return next(new AppError('Restaurant not found', 404));
    }

    // Create the favorite place
    try {
        const favoritePlace = await FavoritePlaces.create({
            userId,
            camis, // Now storing only the camis
        });

        return res.status(201).json({
            status: 'success',
            data: {
                favoritePlace,
            },
        });
    } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
            // Extract the unique constraint error message
            const message = error.errors.map(err => err.message).join(', ');
            return next(new AppError(message, 400)); // Send the custom unique constraint message
        }

        return next(new AppError('Failed to add favorite place', 500)); // General error handling
    }
});

// Get all favorite places for the logged-in user
const getFavoritePlaces = catchAsync(async (req, res, next) => {
    const userId = req.user.id;

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
});

// Remove a favorite place
const deleteFavoritePlace = catchAsync(async (req, res, next) => {
    const { id } = req.params; // id of the favorite place to delete
    const userId = req.user.id;

    const favoritePlace = await FavoritePlaces.findOne({
        where: { id, userId },
    });

    if (!favoritePlace) {
        return next(new AppError('Favorite place not found', 404));
    }

    await favoritePlace.destroy();

    return res.status(204).json({
        status: 'success',
        message: 'Favorite place deleted',
    });
});



// fetch place details
const fetchPlaceDetails = catchAsync(async (req, res, next) => {
    const { name, address } = req.query;

    if (!name || !address) {
        return next(new AppError('Name and address are required', 400));
    }

    const apiKey = process.env.GOOGLE_MAPS_API_KEY;

    try {
        // Step 1: Find place by name and address to get the place ID
        const response = await axios.get('https://maps.googleapis.com/maps/api/place/findplacefromtext/json', {
            params: {
                input: `${name} ${address}`,
                inputtype: 'textquery',
                fields: 'place_id',
                key: apiKey
            }
        });

        if (response.data.status !== 'OK' || !response.data.candidates.length) {     
            return next(new AppError('Place not found', 404));
        } 

        const placeId = response.data.candidates[0].place_id;

        // Step 2: Use place ID to fetch additional details, including photos
        const additionalDetailsResponse = await axios.get('https://maps.googleapis.com/maps/api/place/details/json', {
            params: {
                place_id: placeId,
                key: apiKey,
                fields: 'name,formatted_address,formatted_phone_number,opening_hours,website,rating,photos'
            }
        });

        if (additionalDetailsResponse.data.status !== 'OK') {
            return next(new AppError('Failed to fetch additional details', 500));
        }

        const data = additionalDetailsResponse.data.result;
        const photos = data.photos;
        
        let photoUrl = null;

        // Step 3: If there are photos, get the first photo's URL
        if (photos && photos.length > 0) {
            const photoReference = photos[0].photo_reference;
            const imageUrl = `https://maps.googleapis.com/maps/api/place/photo?photo_reference=${photoReference}&key=${apiKey}&maxwidth=400&maxheight=300`;

            try {
                const imageResponse = await axios.get(imageUrl, { responseType: 'arraybuffer' });
                const imageBuffer = Buffer.from(imageResponse.data, 'binary');
                photoUrl = `data:image/jpeg;base64,${imageBuffer.toString('base64')}`;
            } catch (error) {
                console.error('Error fetching image:', error);
                // Optionally log this but continue without image
            }
        }

        // Step 4: Format the response with details and photo (if available)
        const formattedDetails = {
            name: data.name,
            address: data.formatted_address,
            hours: data.opening_hours,
            website: data.website,
            rating: data.rating,
            phone: data.formatted_phone_number,
            photoUrl // Will be `null` if no photo was fetched
        };

        return res.status(200).json({
            status: 'success',
            data: formattedDetails
        });

    } catch (error) {
        console.error("Error fetching place details:", error);
        return next(new AppError('Failed to fetch place details', 500));
    }
});



module.exports = { addFavoritePlace, getFavoritePlaces, deleteFavoritePlace,  fetchPlaceDetails };

