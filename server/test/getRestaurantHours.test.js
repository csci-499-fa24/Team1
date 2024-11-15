const request = require("supertest");
const express = require("express");
const { getRestaurantHours } = require("../controllers/getRestaurantHours");
const { Restaurants } = require("../models");
const axios = require("axios");

jest.mock("../models");
jest.mock("axios");

const app = express();
app.get("/api/restaurant-hours", getRestaurantHours);

describe("GET /api/restaurant-hours", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return restaurant hours for a valid restaurant CAMIS", async () => {
    Restaurants.findOne.mockResolvedValue({
      camis: "123456",
      dba: "Test Restaurant",
      building: "123",
      street: "Main St",
      boro: "Manhattan",
      zipcode: "10001",
    });

    axios.get.mockResolvedValueOnce({
      data: {
        candidates: [
          {
            place_id: "fakePlaceId", 
          },
        ],
      },
    });

    axios.get.mockResolvedValueOnce({
      data: {
        result: {
          name: "Test Restaurant",
          opening_hours: {
            weekday_text: ["Monday: 9:00 AM – 10:00 PM"],
          },
        },
      },
    });

    const res = await request(app).get("/api/restaurant-hours?camis=123456");

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      name: "Test Restaurant",
      hours: { weekday_text: ["Monday: 9:00 AM – 10:00 PM"] },
    });
  });

  it("should return 404 if restaurant is not found", async () => {
    Restaurants.findOne.mockResolvedValue(null);

    const res = await request(app).get("/api/restaurant-hours?camis=999999");

    expect(res.statusCode).toBe(404);
    expect(res.body.error).toBe("Restaurant not found");
  });

  it("should return 500 if there is an error fetching restaurant hours", async () => {
    Restaurants.findOne.mockRejectedValue(new Error("Database Error"));

    const res = await request(app).get("/api/restaurant-hours?camis=123456");

    expect(res.statusCode).toBe(500);
    expect(res.body.error).toBe("Failed to retrieve restaurant hours");
  });
});
