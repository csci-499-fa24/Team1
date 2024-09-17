const express = require("express");
const router = express.Router();

// Load each controller
const exampleController = require("./example.js");

// Mount each controller under a specific route. These
// will be prefixes to all routes defined inside the controller
router.use("/example", exampleController);

module.exports = router;