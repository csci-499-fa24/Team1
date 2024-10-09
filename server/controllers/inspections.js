// controllers/inspections.js
const { Inspections, Restaurants, Locations } = require('../models');

// Function to get inspection details for a specific restaurant by its camis
exports.getInspectionDetails = async (req, res) => {
  const { camis } = req.params;

  try {
    const inspectionDetails = await Inspections.findAll({
      where: { camis },
      include: [
        {
          model: Restaurants,
          as: 'Restaurant', // Use 'as' to match the name in the association
          attributes: ['dba', 'cuisine_description', 'boro', 'building', 'street', 'zipcode'],
        },
      ],
    });

    if (!inspectionDetails.length) {
      return res.status(404).json({ error: 'Restaurant not found or no inspection data available.' });
    }

    res.status(200).json(inspectionDetails);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to retrieve data' });
  }
};
