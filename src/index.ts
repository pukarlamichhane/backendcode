import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { typeDefs } from './type/typeDefs';
import { resolvers } from './resolvers/resolvers';


async function startServer() {
  
  const server = new ApolloServer({
    typeDefs,
    resolvers,
  });

  const { url } = await startStandaloneServer(server, {
    listen: { port: 4000 },
  });

  console.log(`🚀 Server ready at: ${url}`);
}


startServer().catch((error) => {
  console.error('Failed to start server', error);
});


