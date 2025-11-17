// Quick test script for database connection
const { pool, query } = require('../src/config/database');

async function testDatabase() {
  console.log('\n🧪 Testing Database Connection...\n');

  try {
    // Test 1: Connection
    console.log('1️⃣  Testing connection...');
    const connection = await pool.getConnection();
    console.log('   ✅ Connection successful\n');
    connection.release();

    // Test 2: Show tables
    console.log('2️⃣  Listing tables...');
    const tables = await query('SHOW TABLES');
    console.log(`   ✅ Found ${tables.length} tables:`);
    tables.forEach((table, index) => {
      const tableName = Object.values(table)[0];
      console.log(`      ${index + 1}. ${tableName}`);
    });

    // Test 3: Count records in each table
    console.log('\n3️⃣  Checking table records...');
    for (const table of tables) {
      const tableName = Object.values(table)[0];
      const [result] = await query(`SELECT COUNT(*) as count FROM ${tableName}`);
      console.log(`   📊 ${tableName}: ${result.count} records`);
    }

    console.log('\n✅ All database tests passed!\n');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Database test failed:', error.message);
    process.exit(1);
  }
}

testDatabase();
