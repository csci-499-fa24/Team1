const express = require("express");
const cors = require('cors');
const sequelize = require('sequelize');
const db = require("./models");
const app = express();

const { getInspectionDetails } = require("./controllers/inspections")


app.use(cors());
app.use(express.json());

require('./cron/storeRestaurants');

app.get("/api/home", (req, res) => {
    res.json({message: "Hello World!"});
});

app.use("/api", require("./controllers"));

app.get("/api/inspections/:camis", getInspectionDetails);

db.sequelize.sync({ force: false });

const port = process.env.PORT || 8080;
app.listen(port, () => {
    console.log(`Server started on port ${port}`);
});