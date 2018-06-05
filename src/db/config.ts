import * as cassandra from 'cassandra-driver';

const { DB_URL, KEYSPACE } = process.env;

const client = new cassandra.Client({
    contactPoints: [DB_URL]
});

async function dbConnect() {
    await client.connect();
    await client.execute(`
            CREATE KEYSPACE IF NOT EXISTS proto 
            WITH REPLICATION = {
                'class': 'SimpleStrategy',
                'replication_factor': 1
            };`);
    console.log('Welcome to Cassandra');
}

dbConnect().catch((err) => console.error(`There was an error while connecting to Cassandra: ${err}`));

export default client;