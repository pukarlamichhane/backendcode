import request from "supertest";
import { ApolloServer } from "@apollo/server";
import { typeDefs } from "../src/type/typeDefs"; // Adjust the path as necessary
import { resolvers } from "../src/resolvers/resolvers";
import { startStandaloneServer } from "@apollo/server/standalone";

let server: ApolloServer;

beforeAll(async () => {
  server = new ApolloServer({
    typeDefs,
    resolvers,
  });

  await startStandaloneServer(server, {
    listen: { port: 4000 },
  });
});

afterAll(async () => {
  await server.stop();
});

describe("GraphQL Queries and Mutations", () => {
  // Test for greet query
  it('should return "Hello world" for greet query', async () => {
    const query = `
      query {
        greet
      }
    `;

    const response = await request("http://localhost:4000").post("/").send({
      query,
    });

    expect(response.body.data.greet).toBe("Hello world");
  });

  // Test for books query
  it("should return a list of books", async () => {
    const query = `
      query {
        books {
          id
          title
          author
        }
      }
    `;

    const response = await request("http://localhost:4000").post("/").send({
      query,
    });

    const books = response.body.data.books;
    expect(books.length).toBeGreaterThan(0); // At least one book should exist
    expect(books[0]).toHaveProperty("id");
    expect(books[0]).toHaveProperty("title");
    expect(books[0]).toHaveProperty("author");
  });

  // Test for createTodo mutation
  it("should create a new todo", async () => {
    const mutation = `
      mutation {
        createTodo(input: { task: "New Task", description: "New Description", severity: "high" })
      }
    `;

    const response = await request("http://localhost:4000").post("/").send({
      query: mutation,
    });

    expect(response.body.data.createTodo).toBe("Create sucessfully");
  });

  // Test for updateTodo mutation
  it("should update an existing todo", async () => {
    const mutation = `
      mutation {
        updateTodo(input: { id: "1", task: "Updated Task", description: "Updated Description", severity: "medium", complete: false })
      }
    `;

    const response = await request("http://localhost:4000").post("/").send({
      query: mutation,
    });

    expect(response.body.data.updateTodo).toBe("Update sucessfully");
  });

  // Test for deleteTodo mutation
  it("should delete an existing todo", async () => {
    const mutation = `
      mutation {
        deleteTodo(id: "1")
      }
    `;

    const response = await request("http://localhost:4000").post("/").send({
      query: mutation,
    });

    expect(response.body.data.deleteTodo).toBe("Delete sucessfully");
  });
});
