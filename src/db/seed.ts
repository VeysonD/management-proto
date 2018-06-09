import * as dotenv from 'dotenv';

dotenv.config();

import * as cassandra from 'cassandra-driver';

const { DB_URL } = process.env;

const client = new cassandra.Client({
    contactPoints: [DB_URL]
});

const createWorkspacesTable = `
    CREATE TABLE IF NOT EXISTS workspaces(
        id text PRIMARY KEY,
        title text,
        owner_id text,
        members set<text>,
        admins text,
        guests set<text>
    );
`;

const createUsersTable = `
  CREATE TABLE IF NOT EXISTS users( 
      id text PRIMARY KEY,
      email text,
      name text
    );
`;

const createProjectsType = `
  CREATE TYPE IF NOT EXISTS projects(
      title text,
      description text
    );
`;

const createTasksTable = `
  CREATE TABLE IF NOT EXISTS tasks(
      id text PRIMARY KEY,
      name text,
      description text,
      in_project frozen<projects>
    );
`;

const insertUser = `INSERT INTO users(id, email, name) VALUES(?, ?, ?)`;
const userParams = ['1a', 'bob@yahoo.co.jp', 'Bob'];

const insertTask = `INSERT INTO tasks(id, name, description, in_project) VALUES(?, ?, ?, ?)`;
const taskParams = [
    't1',
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

    await client.execute(createWorkspacesTable);
    console.log('Workspaces table created');

    await client.execute(createUsersTable);
    console.log('Users Table created');

    await client.execute(createProjectsType);
    console.log('Projects type created');

    await client.execute(createTasksTable);
    console.log('Tasks table created');
    console.log('Now inserting data into keyspace');

    await client.batch(insertionQueries, queryOptions, (err) => {
        if (err) console.error(err);
        else {
            console.log('Data inserted into keyspace proto');
            console.log('Seeding finished');
            client.shutdown();
        }
    }); 
}

dbSeed().catch((err) => {
    console.error(`There was an error while seeding Cassandra: ${err}`);
    client.shutdown();
});