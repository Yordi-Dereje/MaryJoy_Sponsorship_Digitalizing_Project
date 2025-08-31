// test-db.js
const { pool, testConnection } = require('./config/database');

async function test() {
  console.log('Testing database connection...');
  const isConnected = await testConnection();
  console.log('Connection result:', isConnected);
  
  if (isConnected) {
    try {
      const result = await pool.query('SELECT NOW() as time');
      console.log('Query result:', result.rows[0]);
    } catch (error) {
      console.error('Query error:', error);
    }
  }
  
  await pool.end();
}

test();
