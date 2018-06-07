import * as Express from 'express';
import { graphqlExpress, graphiqlExpress } from 'apollo-server-express';
import { makeExecutableSchema } from 'graphql-tools';

import client from '../db/config';

const apiRouter = Express.Router();

// Mock data
const books = [
    {
        title: 'Harry Potter and the Sorcerer\'s stone',
        author: 'J.K. Rowling',
    },
    {
        title: 'Jurassic Park',
        author: 'Michael Crichton',
    },
];

// The GraphQL schema in string form
const typeDefs = `
    type Query { books: [Book] }
    type Book { title: String, author: String }
`;

// The Resolvers
const resolvers = {
    Query: { books: () => books },
};

// Put together a schema
const schema = makeExecutableSchema({
    typeDefs,
    resolvers,
})

// GraphQL endpoint
apiRouter.use('/graphql', graphqlExpress({ schema }));

// GraphiQL visual editor for queries
apiRouter.get('/', graphiqlExpress({ endpointURL: '/graphql' }));

// Test route
apiRouter.get('/test', (_req, res) => {
    console.log({client});
    const date = new Date();
    res.send(`API route check: ${date}`);
});

export default apiRouter;