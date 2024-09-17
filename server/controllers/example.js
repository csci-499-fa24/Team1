
const express = require("express");
const router = express.Router();
const db = require("../models"); // Import Sequelize models

// Route to create a new example
router.post("/", async (req, res) => {
  const { title, description } = req.body;

  if (!title) {
    return res.status(400).json({
      message: "Title is required",
    });
  }

  try {
    if (!db.Example) {
      throw new Error('Example model is not defined');
    }

    const newExample = await db.Example.create({
      title,
      description,
    });

    res.status(201).json({
      message: "Example created",
      example: newExample,
    });
  } catch (error) {
    console.error("Error posting", error);
    res.status(500).json({
      message: "An error occurred while creating example",
      error: error.message,
    });
  }
});

//Getting the examples from database
router.get("/", async (req, res) => {
    try {
        const examples = await db.Example.findAll();
        res.status(200).json(examples);
    } catch (error) {
        console.error("Error fetching examples", error);
        res.status(500).json({
        message: "An error occurred while fetching examples",
        error: error.message,
        });
    }
});

module.exports = router;
