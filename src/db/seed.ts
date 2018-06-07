import * as dotenv from 'dotenv';

dotenv.config();

import * as cassandra from 'cassandra-driver';

const { DB_URL } = process.env;

const client = new cassandra.Client({
    contactPoints: [DB_URL]
});

const createUserTable = `
  CREATE TABLE IF NOT EXISTS user(
      username text PRIMARY KEY,
      password text
    );
`;

const createProjectType = `
  CREATE TYPE IF NOT EXISTS project(
      title text,
      description text
    );
`;

const createTaskTable = `
  CREATE TABLE IF NOT EXISTS task(
      name text PRIMARY KEY,
      description text,
      in_project frozen<project>
    );
`;

const insertUser = `INSERT INTO user(username, password) VALUES(?, ?)`;
const userParams = ['bob', '123456'];

const insertTask = `INSERT INTO task(name, description, in_project) VALUES(?, ?, ?)`;
const taskParams = [
    'Add Weather Widget',
    'Add a feature that allows the user to check the weather',
    {
        title: 'Weather App',
        description: 'Application that will show the user the weather'
    }
];

const insertionQueries = [
    {
        query: insertUser,
        params: userParams
    },
    {
        query: insertTask,
        params: taskParams
    }
];

const queryOptions = {
    prepare: true,
    consistency: cassandra.types.consistencies.quorom
};

async function dbSeed() {
    await client.connect();
    await client.execute(`
            CREATE KEYSPACE IF NOT EXISTS proto 
            WITH REPLICATION = {
                'class': 'SimpleStrategy',
                'replication_factor': 1
            };`);
    console.log('proto keyspace created');

    await client.execute(`USE proto`);
    console.log('Connected to proto keyspace');
    console.log('Now seeding');

    await client.execute(createUserTable);
    console.log('User Tables created');

    await client.execute(createProjectType);
    console.log('Project type created');

    await client.execute(createTaskTable);
    console.log('Task table created');
    console.log('Now inserting data into keyspace');

    await client.batch(insertionQueries, queryOptions, (err) => {
        if (err) console.error(err);
        else {
            console.log('Data inserted into keyspace');
            console.log('Seeding finished');
            client.shutdown();
        }
    });
    
}

dbSeed().catch((err) => console.error(`There was an error while seedoing Cassandra: ${err}`));