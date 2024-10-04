require('dotenv').config({path: `${process.cwd()}/.env`});
const express = require("express");
const cors = require('cors');
const sequelize = require('sequelize');
const db = require("./models");
const app = express();

//
const authRouter = require('./route/authRoute');
const globalErrorHandler = require("./controllers/errorController");
const catchAsync = require("./utils/asyncError");



app.use(cors());
app.use(express.json());

app.get("/api/home", (req, res) => {
    res.json({message: "Hello World!"});
});

app.use("/api", require("./controllers"));


//routes for signup and login
app.use('/api/v1/auth', authRouter);


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