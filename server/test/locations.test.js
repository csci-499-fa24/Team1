const request = require("supertest");
const express = require("express");
const router = require("../controllers/locations"); 
const db = require("../models"); 

jest.mock("../models"); 

const app = express();
app.use("/", router);

describe("GET /locations", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return a list of locations with restaurant details", async () => {
    const mockLocations = [
      {
        latitude: "40.7128",
        longitude: "-74.0060",
        Restaurant: {
          dba: "Fuel Grill & Juice Bar",
          building: "123",
          street: "Main St",
          zipcode: "10001",
          boro: "Manhattan",
          cuisine_description: "American", 
          phone: "1234567890",
        },
      },
    ];

    
    db.Locations.findAll.mockResolvedValue(mockLocations);

    const response = await request(app).get("/");

    
    expect(response.statusCode).toBe(200);
    
    expect(response.headers["cache-control"]).toBe("no-store");
    
    expect(response.body).toEqual(mockLocations);
   
    expect(db.Locations.findAll).toHaveBeenCalledTimes(1);
    
    expect(db.Locations.findAll).toHaveBeenCalledWith({
      attributes: ['camis', 'latitude', 'longitude'],
      include: [
        {
          model: db.Restaurants,
          attributes: ['dba', 'building', 'street', 'zipcode', 'boro', 'cuisine_description', 'phone'],
        },
      ],
    });
  });

  it("should return a 500 status and error message on failure", async () => {
    db.Locations.findAll.mockRejectedValue(new Error("Database Error"));

    const response = await request(app).get("/");

    expect(response.statusCode).toBe(500);
    expect(response.body).toEqual({ error: "Internal server error" });
    expect(db.Locations.findAll).toHaveBeenCalledTimes(1);
  });
});
