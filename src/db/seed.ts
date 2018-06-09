import * as dotenv from 'dotenv';

dotenv.config();

import * as cassandra from 'cassandra-driver';

const { DB_URL } = process.env;

const client = new cassandra.Client({
    contactPoints: [DB_URL]
});

// owner_id, members <set>, admins <set>, and guests <set> columns will contain foreign keys
const createWorkspacesTable = `
    CREATE TABLE IF NOT EXISTS workspaces(
        id text PRIMARY KEY,
        title text,
        owner_id text,
        members set<text>,
        admins set<text>,
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

// members <set>, admins <set>, and owner_id columns will contain foreign keys
const createProjectsTable = `
    CREATE TABLE IF NOT EXISTS projects(
        id text PRIMARY KEY,
        title text,
        due_date timestamp,
        start_date timestamp,
        members set<text>,
        admins set<text>,
        owner_id text
    )
`;

// tasks <set> column will contain foreign keys
const createTasklistsTable = `
    CREATE TABLE IF NOT EXISTS tasklists (
        id text PRIMARY KEY,
        tasks set<text>
    )
`;

// assignees <set> and owner_id column will contain foreign keys
const createTasksTable = `
  CREATE TABLE IF NOT EXISTS tasks(
      id text PRIMARY KEY,
      title text,
      description text,
      assignees set<text>,
      owner_id text
    );
`;

const insertUser1 = `INSERT INTO users(id, email, name) VALUES(?, ?, ?)`;
const user1Params = ['u1', 'bob@yahoo.co.jp', 'Bob'];

const insertUser2 = `INSERT INTO users(id, email, name) VALUES(?, ?, ?)`;
const user2Params = ['u2', 'joe@yahoo.com', 'Joe'];

const insertUser3 = `INSERT INTO users(id, email, name) VALUES(?, ?, ?)`;
const user3Params = ['u3', 'ann@google.com', 'Ann'];

const insertTask = `INSERT INTO tasks(id, title, description, assignees, owner_id) VALUES(?, ?, ?, ?, ?)`;
const taskParams = [
    't1',
    'Add Weather Widget',
    'Add a feature that allows the user to check the weather',
    [
        'u2', 'u3'
    ],
    'u1'
];

const insertionQueries = [
    {
        query: insertUser1,
        params: user1Params
    },
    {
        query: insertUser2,
        params: user2Params
    },
    {
        query: insertUser3,
        params: user3Params,
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
    console.log('Users table created');

    await client.execute(createProjectsTable);
    console.log('Projects table created');

    await client.execute(createTasklistsTable);
    console.log('Tasklists table created');

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