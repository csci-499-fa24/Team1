const express = require("express");
const router = express.Router();
const db = require("../models");

router.get("/", async (req, res) => {
  try {
    const locations = await db.Locations.findAll({
      attributes: ['camis', 'latitude', 'longitude'], 
      include: [
        {
          model: db.Restaurants,
          attributes: ['dba', 'building', 'street', 'zipcode', 'boro'], 
        },
      ],
    });
    res.setHeader('Cache-Control', 'no-store');
    res.status(200).json(locations); 
  } catch (error) {
    console.error('Error fetching location data:', error);
    res.status(500).json({ error: 'Internal server error' }); 
  }
});

module.exports = router;
