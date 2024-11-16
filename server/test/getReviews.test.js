const request = require("supertest");
const express = require("express");
const { getRestaurantReviews } = require("../controllers/getReviews");
const { Restaurants } = require("../models");
const axios = require("axios");

jest.mock("../models");
jest.mock("axios");

const app = express();
app.get("/api/reviews", getRestaurantReviews);

describe("GET /api/reviews", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return reviews for a valid restaurant CAMIS", async () => {
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
          reviews: [
            {
              author_name: "John Doe",
              rating: 5,
              text: "Great place!",
              time: 1632499200, 
            },
          ],
        },
      },
    });

    const res = await request(app).get("/api/reviews?camis=123456");

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual([
      {
        author_name: "John Doe",
        rating: 5,
        text: "Great place!",
        date: "9/24/2021", 
      },
    ]);
  });

  it("should return 404 if restaurant is not found", async () => {
    Restaurants.findOne.mockResolvedValue(null);

    const res = await request(app).get("/api/reviews?camis=999999");

    expect(res.statusCode).toBe(404);
    expect(res.body.error).toBe("Restaurant not found");
  });

  it("should return 500 if there is an error fetching reviews", async () => {
    Restaurants.findOne.mockRejectedValue(new Error("Database Error"));

    const res = await request(app).get("/api/reviews?camis=123456");

    expect(res.statusCode).toBe(500);
    expect(res.body.error).toBe("Failed to retrieve restaurant reviews");
  });
});
