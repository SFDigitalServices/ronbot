const { Client } = require('pg');
const config = require('../config.js');

const connectionConfig = {
  connectionString: config.DATABASE_URL
};

if(process.env.NODE_ENV === "production") {
  connectionConfig.ssl = { rejectUnauthorized: false };
}

const client = new Client(connectionConfig);

client.connect();

client.query('SELECT table_schema,table_name FROM information_schema.tables;', (err, res) => {
  if (err) throw err;
  for (let row of res.rows) {
    console.log(JSON.stringify(row));
  }
  client.end();
});