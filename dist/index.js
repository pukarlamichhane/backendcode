"use strict";
// import { ApolloServer } from '@apollo/server';
// import { startStandaloneServer } from '@apollo/server/standalone';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// const typeDefs = `#graphql
//   type Book {
//     id: ID
//     title: String
//     author: String
//   }
//   type Query {
//     greet: String
//     books: [Book]
//     book(id: ID!): Book
//   }
// `;
// const books = [
//   {
//     id: "1",
//     title: 'The Awakening',
//     author: 'Kate Chopin',
//   },
//   {
//     id: "2",
//     title: 'City of Glass',
//     author: 'Paul Auster',
//   },
// ];
// const resolvers = {
//   Query: {
//     books: () => books,
//     greet: () => "Hello world",
//     book: (_: any, args: { id: string; }) => {
//       return books.find((book) => book.id === args.id) || null;
//     },
//   },
// };
// async function startServer() {
//   const server = new ApolloServer({
//     typeDefs,
//     resolvers,
//   });
//   const { url } = await startStandaloneServer(server, {
//     listen: { port: 4000 },
//   });
//   console.log(`🚀 Server ready at: ${url}`);
// }
// startServer().catch((error) => {
//   console.error('Failed to start server', error);
// });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const body_parser_1 = __importDefault(require("body-parser"));
const routes_1 = require("./routes/routes");
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: '*'
}));
app.use(body_parser_1.default.json());
app.use("/api", routes_1.router);
app.listen(3000, () => {
    console.log(`Server is listening at port :3000`);
});
