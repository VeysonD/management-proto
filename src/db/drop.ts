import * as dotenv from 'dotenv';

dotenv.config();

import * as cassandra from 'cassandra-driver';

const { DB_URL } = process.env;

const client = new cassandra.Client({
    contactPoints: [DB_URL]
});

const dropUserTable = `DROP TABLE IF EXISTS proto.user`;
const dropTaskTable = `DROP TABLE IF EXISTS proto.task`;

async function dbDrop() {
    await client.connect();
    await client.execute(dropUserTable);
    console.log('User table dropped');

    await client.execute(dropTaskTable);
    console.log('Task table dropped');

    console.log('Shutting down');
    client.shutdown();
}

dbDrop().catch(err => console.error(`There was an error while dropping the tables: ${err}`));