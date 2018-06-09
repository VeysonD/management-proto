import * as dotenv from 'dotenv';

dotenv.config();

import * as cassandra from 'cassandra-driver';

const { DB_URL } = process.env;

const client = new cassandra.Client({
    contactPoints: [DB_URL]
});

async function dbDrop() {
    await client.connect();
    console.log('Connected to cassandra');
    await client.execute('DROP KEYSPACE IF EXISTS proto');
    console.log('Keyspace proto dropped');

    console.log('Shutting down');
    client.shutdown();
}

dbDrop().catch(err => console.error(`There was an error while dropping the keyspace: ${err}`));