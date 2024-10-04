import request from "supertest";
import app from "../src/index"; // Adjust this if your Express app is in a different file

// Mock data for creating a new Todo
const todoData = {
  task: "Test Task",
  description: "Test Description",
  severity: "high",
};

describe("Todo API End-to-End Testing", () => {
  // Test the GET /api/gettodo route
  it("should fetch all todos - GET /api/gettodo", async () => {
    const res = await request(app).get("/api/gettodo");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true); // Expect it to return an array
  });

  // Test the POST /api/create route
  it("should create a new todo - POST /api/create", async () => {
    const res = await request(app).post("/api/create").send(todoData);
    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Successfully created");
  });

  // Test the PUT /api/put/:num route
  it("should update an existing todo - PUT /api/put/:num", async () => {
    const idToUpdate = 1; // Assumes that an item with id 1 exists
    const updatedData = {
      task: "Updated Task",
      description: "Updated Description",
      severity: "medium",
    };

    const res = await request(app)
      .put(`/api/put/${idToUpdate}`)
      .send(updatedData);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Successfully updated");
  });

  // Test the DELETE /api/delete/:num route
  it("should delete a todo - DELETE /api/delete/:num", async () => {
    const idToDelete = 1; // Assumes that an item with id 1 exists
    const res = await request(app).delete(`/api/delete/${idToDelete}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Successfully deleted");
  });

  // Test Elasticsearch Aggregation - POST /api/getagg
  it("should aggregate todos by severity - POST /api/getagg", async () => {
    const aggData = {
      start: "2024-01-01T00:00:00.000Z",
      end: "2024-12-31T23:59:59.999Z",
    };

    const res = await request(app).post("/api/getagg").send(aggData);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true); // Expect aggregation result to be an array
  });
});
