const request = require("supertest");
const express = require("express");
const router = require("../controllers/example"); // Adjust the path if necessary
const db = require("../models");

// Create an Express application for testing
const app = express();
app.use(express.json());
app.use("/example", router);

jest.mock("../models"); // Mock the Sequelize models

describe("Example API", () => {
  
  describe("POST /example", () => {
    it("should return 400 if title is missing", async () => {
      const response = await request(app).post("/example").send({
        description: "Test description",
      });
      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Title is required");
    });

    it("should return 201 and create a new example", async () => {
      // Mock the Example.create method
      db.Example.create = jest.fn().mockResolvedValue({
        id: 1,
        title: "Test title",
        description: "Test description",
      });

      const response = await request(app)
        .post("/example")
        .send({
          title: "Test title",
          description: "Test description",
        });

      expect(response.status).toBe(201);
      expect(response.body.message).toBe("Example created");
      expect(response.body.example).toEqual({
        id: 1,
        title: "Test title",
        description: "Test description",
      });
    });

    it("should return 500 if Example model is not defined", async () => {
      db.Example.create = jest.fn().mockRejectedValue(new Error("Example model is not defined"));

      const response = await request(app)
        .post("/example")
        .send({
          title: "Test title",
          description: "Test description",
        });

      expect(response.status).toBe(500);
      expect(response.body.message).toBe("An error occurred while creating example");
      expect(response.body.error).toBe("Example model is not defined");
    });
  });

  describe("GET /example", () => {
    it("should return all examples", async () => {
      const mockExamples = [
        { id: 1, title: "Example 1", description: "Description 1" },
        { id: 2, title: "Example 2", description: "Description 2" },
      ];

      // Mock the Example.findAll method
      db.Example.findAll = jest.fn().mockResolvedValue(mockExamples);

      const response = await request(app).get("/example");

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockExamples);
    });

    it("should return 500 if there is a server error", async () => {
      db.Example.findAll = jest.fn().mockRejectedValue(new Error("Server error"));

      const response = await request(app).get("/example");

      expect(response.status).toBe(500);
      expect(response.body.message).toBe("An error occurred while fetching examples");
      expect(response.body.error).toBe("Server error");
    });
  });
});