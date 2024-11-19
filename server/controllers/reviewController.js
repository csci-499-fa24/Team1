const { Review, Restaurants, User } = require('../models');

exports.getReviews = async (req, res) => {
    try {
        const { id: camis } = req.params;

        const reviews = await Review.findAll({ where: { camis },
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['userName'], 
                },
            ],
        });

        if (!reviews || reviews.length === 0) {
            return res.status(404).json({ status: 'error', message: 'No reviews found for this restaurant' });
        }

        res.status(200).json(reviews);
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Something went very wrong', error: error.message });
    }
};

exports.addReview = async (req, res) => {
    try {
        const { camis, rating, comment } = req.body;
        const userId = req.user.id; 

        const restaurant = await Restaurants.findOne({ where: { camis } });
        if (!restaurant) {
            return res.status(404).json({ error: 'Restaurant not found' });
        }
        
        const review = await Review.create({ camis, userId, rating, comment });
        // Fetch the review with the user's name included
        const createdReview = await Review.findByPk(review.id, {
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['userName'],
                },
            ],
        });
        res.status(201).json(createdReview);                
    } catch (error) {
        console.error('Error adding review:', error);
        res.status(500).json({ error: 'Failed to add review' });
    }
};

exports.editReview = async (req, res) => {
    try {
        const { id } = req.params; // Review ID
        const { rating, comment } = req.body;
        const userId = req.user.id; 

        const review = await Review.findByPk(id);
        if (!review) {
            return res.status(404).json({ error: 'Review not found' });
        }

        if (review.userId !== userId) {
            return res.status(403).json({ error: 'You can only edit your own reviews' });
        }

        review.rating = rating || review.rating;
        review.comment = comment || review.comment;
        await review.save();

        // Fetch the updated review with the user's name included
        const updatedReview = await Review.findByPk(id, {
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['userName'],
                },
            ],
        });
        res.status(200).json(updatedReview); // Ensure updatedAt is included            
    } catch (error) {
        console.error('Error editing review:', error);
        res.status(500).json({ error: 'Failed to edit review' });
    }
};

exports.deleteReview = async (req, res) => {
    try {
        const { id } = req.params; 
        const userId = req.user.id; 

        const review = await Review.findByPk(id);
        if (!review) {
            return res.status(404).json({ error: 'Review not found' });
        }

        if (review.userId !== userId) {
            return res.status(403).json({ error: 'You can only delete your own reviews' });
        }

        await review.destroy();
        res.status(200).json({ message: 'Review deleted successfully' });
    } catch (error) {
        console.error('Error deleting review:', error);
        res.status(500).json({ error: 'Failed to delete review' });
    }
};
