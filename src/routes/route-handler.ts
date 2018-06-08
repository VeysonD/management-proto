import * as Express from 'express';
import { graphqlExpress, graphiqlExpress } from 'apollo-server-express';
import { makeExecutableSchema } from 'graphql-tools';

import client from '../db/config';

const apiRouter = Express.Router();

// Mock data
const books = [
    {
        id: 'B1',
        title: 'Harry Potter and the Chamber of Secrets',
        published: '2 July 1998',
        author: { id: 'A1', name: 'J.K. Rowling' },
    },
    {
        id: 'B2',
        title: 'Harry Potter and the Philosopher\'s Stone',
        published: '26 June 1997',
        author: { id: 'A1', name: 'J.K. Rowling' },
    },
    {
        id: 'B3',
        title: 'Harry Potter and the Prisoner of Azkaban',
        published: '8 July 1999',
        author: { id: 'A1', name: 'J.K. Rowling' },
    },
    {
        id: 'B4',
        title: 'Jurassic Park',
        published: '1990',
        author: { id: 'A2', name: 'Michael Crichton' },
    },
    {
        id: 'B5',
        title: 'Airframe',
        published: '1996',
        author: { id: 'A2', name: 'Michael Crichton' },
    },
]

// The GraphQL schema in string form
const typeDefs = `
    type Query {
        authors: [Author]
        books: [Book]
    }

    type Book {
        id: ID
        title: String,
        author: Author
    }

    type Author {
        id: ID
        name: String
        books: [Book]
    }
`;

// The Resolvers
const resolvers = {
    Query: { 
        books: () => {
            console.log(`Resolve Query.books()`);
            return books;
        },
        authors: () => {
            console.log(`Resolve Query.authors()`);
            return books.map(book => book.author);
        }
    },
    Author: {
        books: author => {
            console.log(`Resolve Author.books(${author.id})`);
            return books.filter(book => book.author.id === author.id);
        }
    }
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