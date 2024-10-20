const { FavoritePlaces, Restaurants, Locations, User } = require('../models');

// Add a new favorite place
const addFavoritePlace = async (req, res, next) => {
    try {
        const { camis } = req.body; // The camis (restaurant ID) is passed in the request body
        const userId = req.user.id; // Assuming user is authenticated and userId is available

        // Check if the restaurant with the provided camis exists
        const restaurant = await Restaurants.findOne({ where: { camis } });

        if (!restaurant) {
            return res.status(404).json({ message: 'Restaurant not found' });
        }

        // Create the favorite place
        const favoritePlace = await FavoritePlaces.create({
            userId,
            camis,  // Now storing only the camis
        });

        return res.status(201).json({
            status: 'success',
            data: {
                favoritePlace,
            },
        });
    } catch (error) {
        next(error); // Passes error to global error handler
    }
};

// Get all favorite places for the logged-in user
const getFavoritePlaces = async (req, res, next) => {
    try {
        const userId = req.user.id;

        // Fetch favorite places and include associated restaurant and location details
        const favoritePlaces = await FavoritePlaces.findAll({
            where: { userId },
            include: [
                {
                    model: Restaurants,
                    attributes: ['dba', 'building', 'street', 'zipcode', 'boro'], // Fetch restaurant data
                    include: {
                        model: Locations,  // Nested include to fetch location data
                        attributes: ['latitude', 'longitude'],
                    },
                },
            ],
        });

        return res.status(200).json({
            status: 'success',
            data: {
                favoritePlaces,
            },
        });
    } catch (error) {
        next(error);
    }
};

// Remove a favorite place
const deleteFavoritePlace = async (req, res, next) => {
    try {
        const { id } = req.params; // id of the favorite place to delete
        const userId = req.user.id;

        const favoritePlace = await FavoritePlaces.findOne({
            where: { id, userId },
        });

        if (!favoritePlace) {
            return res.status(404).json({ message: 'Favorite place not found' });
        }

        await favoritePlace.destroy();

        return res.status(204).json({ message: 'Favorite place deleted' });
    } catch (error) {
        next(error);
    }
};

module.exports = { addFavoritePlace, getFavoritePlaces, deleteFavoritePlace };

