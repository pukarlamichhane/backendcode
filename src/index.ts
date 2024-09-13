// import { ApolloServer } from '@apollo/server';
// import { startStandaloneServer } from '@apollo/server/standalone';


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


import express, { Express } from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { router } from "./routes/routes";


const app:Express = express();


app.use(cors({
  origin: '*'
}))
app.use(bodyParser.json())

app.use("/api",router)

app.listen(3000,()=>{
  console.log(`Server is listening at port :3000`);
})



