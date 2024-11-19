const { getUserInfo, updateUserInfo } = require("../controllers/settingsController");
const { authentication } = require("../controllers/authController");
const router = require("express").Router();


// Route to get user info
router.get("/getInfo",authentication, getUserInfo);

// Route to update user info
router.patch("/updateInfo",authentication, updateUserInfo);

module.exports = router;