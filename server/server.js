
require('dotenv').config({path: `${process.cwd()}/.env`});

const express = require("express");
const cors = require('cors');
const sequelize = require('sequelize');
const db = require("./models");
const app = express();


const { getInspectionDetails } = require("./controllers/inspections")
const reviewsRoute = require('./controllers/getReviews');
const locationController = require("./controllers/locations.js");

const authRouter = require('./routes/authRoute');
const globalErrorHandler = require("./controllers/errorController");
const catchAsync = require("./utils/asyncError");
const cookieParser = require('cookie-parser');
const favoriteRouter = require('./routes/favoriteRoute');
const userPlanRoutes = require('./routes/userPlanRoute');

const reviewRoutes = require('./routes/reviewsRoute');

const settingsRoutes = require("./routes/settingsRoute");


//CORS configuration ensures that your server allows requests from
//http://localhost:3000 and supports credentials (cookies).
const corsOptions = {
    origin: process.env.NEXT_PUBLIC_CLIENT_URL, // Your frontend's origin
    credentials: true, // Allow credentials (cookies)
};



app.use(cookieParser());
app.use(cors(corsOptions));

app.use(express.json());

require('./cron/storeRestaurants');

app.get("/api/home", (req, res) => {
    res.json({message: "Hello World!"});
});

app.use("/api/locations", locationController);
app.get("/api/inspections/:camis", getInspectionDetails);

const { getRestaurantHours } = require('./controllers/getRestaurantHours'); // Import the route for fetching restaurant hours
app.get('/api/restaurant-hours', getRestaurantHours); //route to fetch restaurant hours
app.get('/api/v1/restaurant-reviews', reviewsRoute.getRestaurantReviews);
app.use('/api/reviews', reviewRoutes);
//routes for signup and login
app.use('/api/v1/auth', authRouter);

//routes for favoritePlaces
app.use('/api/v1/favorites', favoriteRouter);

//user-plan
app.use('/api/v1/user-plans', userPlanRoutes);

//settings
app.use("/api/v1/settings", settingsRoutes);

//no route match
app.use('*', catchAsync (async(req, res, next) => {

    throw new AppError(`Can't find ${req.originalUrl} on this server`, 404);
}));

//global error handler
app.use(globalErrorHandler);


db.sequelize.sync({ force: false });

const port = process.env.PORT || 8080;
app.listen(port, () => {
    console.log(`Server started on port ${port}`);
});
