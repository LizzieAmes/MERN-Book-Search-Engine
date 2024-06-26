const express = require('express');
const path = require('path');
const db = require('./config/connection');
// const routes = require('./routes');
const { authMiddleware } = require('./utils/auth');

const { ApolloServer } = require('apollo-server-express');
const { typeDefs, resolvers } = require('./schemas');

const app = express();
const PORT = process.env.PORT || 3001;

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: authMiddleware,
  //Disable persisted queries
  persistedQueries: false,
});


async function startApolloServer() {
  await server.start();
   console.log('Apollo Server started and middleware applied');
  server.applyMiddleware({ app, path: '/graphql' }); 

  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());

  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../client/dist')));
  }

  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
  });

  db.once('open', () => {
    app.listen(PORT, () =>
      console.log(`🌍 Now listening on localhost:${PORT}`)
    );
  });
}


startApolloServer();
