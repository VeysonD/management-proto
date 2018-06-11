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
        projects set<text>,
        members set<text>,
        admins set<text>,
        guests set<text>,
        owner_id text
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
        description text,
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
        title text,
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
      owner_id text,
      last_updated timestamp
    );
`;

const insertUser1 = `INSERT INTO users(id, email, name) VALUES(?, ?, ?)`;
const user1Params = ['u1', 'bob@yahoo.co.jp', 'Bob'];

const insertUser2 = `INSERT INTO users(id, email, name) VALUES(?, ?, ?)`;
const user2Params = ['u2', 'joe@yahoo.com', 'Joe'];

const insertUser3 = `INSERT INTO users(id, email, name) VALUES(?, ?, ?)`;
const user3Params = ['u3', 'ann@google.com', 'Ann'];

const insertTask1 = `INSERT INTO tasks(id, title, description, assignees, owner_id, last_updated) VALUES(?, ?, ?, ?, ?, ?)`;
const taskParams1 = [
    't1',
    'Add Weather Widget',
    'Add a feature that allows the user to check the weather',
    [
        'u2', 'u3'
    ],
    'u1',
    new Date()
];

const insertTask2 = `INSERT INTO tasks(id, title, description, assignees, owner_id, last_updated) VALUES(?, ?, ?, ?, ?, ?)`;
const taskParams2 = [
    't2',
    'Add Cooking Widget',
    'Add a feature that allows the user to check the microwave',
    [
        'u2', 'u3'
    ],
    'u1',
    new Date()
];

const insertWorkspace = `INSERT INTO workspaces(id, title, projects, members, admins, guests, owner_id) VALUES (?, ?, ?, ?, ?, ?, ?)`
const workspaceParams = [
    'w1',
    'Duty Planet',
    ['p1'],
    ['u1', 'u2', 'u3'],
    ['u1'],
    [],
    'u1'
];


const insertProject = `INSERT INTO projects(id, title, description, due_date, start_date, members, admins, owner_id) VALUES(?, ?, ?, ?, ?, ?, ?, ?)`;
const projectParams = [
    'p1',
    'General App',
    'Project to create an application that will do it all',
    Date.now(),
    Date.now(),
    ['u1', 'u2', 'u3'],
    ['u1', 'u2'],
    'u1'
]

const insertTasklist = `INSERT INTO tasklists(id, title, tasks) VALUES(?, ?, ?)`;
const tasklistParams = [
    'tl1',
    'Queued Tasks',
    [
        't1'
    ]
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
        query: insertTask1,
        params: taskParams1
    },
    {
        query: insertTask2,
        params: taskParams2
    },
    {
        query: insertTasklist,
        params: tasklistParams
    },
    {
        query: insertProject,
        params: projectParams
    },
    {
        query: insertWorkspace,
        params: workspaceParams
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
            client.execute(`UPDATE tasks SET last_updated = '2019-05-05' where id='t1'`)
              .then(() => {
                  console.log('Data inserted into keyspace proto');
                  console.log('Seeding finished');
                  client.shutdown();
              });
        }
    });

    // // Test WRITETIME CQL function 
    // const time1 = (await client.execute(`SELECT WRITETIME(email) FROM users WHERE id='u1'`)).rows[0]['writetime(email)'];
    // console.log('Write time for User 1\'s email retrieved: ', time1);

    // await client.execute(`UPDATE users SET email = 'bobobobob@bing.com' WHERE id='u1'`);
    // console.log('Updated user 1\'s email to bobobobob@bing.com');

    // const time2 = (await client.execute(`SELECT WRITETIME(email) FROM users WHERE id='u1'`)).rows[0]['writetime(email)'];
    // console.log('Write time for User 1\'s updated email retrieved: ', time2);
}

dbSeed().catch((err) => {
    console.error(`There was an error while seeding Cassandra: ${err}`);
    client.shutdown();
});