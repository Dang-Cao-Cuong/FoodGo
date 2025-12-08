const fs = require('fs');
const path = require('path');
const { pool } = require('../src/config/database');

async function cleanupDatabase() {
  try {
    console.log('🧹 Starting database cleanup...\n');

    // Read migration file
    const migrationPath = path.join(__dirname, '..', 'src', 'database', 'migrations', '004_remove_unused_tables.sql');
    console.log('📖 Reading cleanup script:', migrationPath);
    const sqlContent = fs.readFileSync(migrationPath, 'utf8');

    // Split SQL statements
    const statements = [];
    let currentStatement = '';
    
    const lines = sqlContent.split('\n');
    for (const line of lines) {
      const trimmedLine = line.trim();
      
      if (trimmedLine.startsWith('--') || 
          trimmedLine.startsWith('/*') || 
          trimmedLine.startsWith('*') ||
          trimmedLine.length === 0) {
        continue;
      }
      
      currentStatement += ' ' + trimmedLine;
      
      if (trimmedLine.endsWith(';')) {
        statements.push(currentStatement.trim().replace(/;$/, ''));
        currentStatement = '';
      }
    }

    console.log(`📝 Found ${statements.length} SQL statements to execute\n`);

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      // Skip SELECT messages and USE database
      if (statement.includes("SELECT '") || 
          statement.toUpperCase().startsWith('USE ') ||
          statement.toUpperCase().startsWith('SELECT TABLE_NAME')) {
        continue;
      }

      try {
        console.log(`🔄 Executing statement ${i + 1}...`);
        
        if (statement.toUpperCase().includes('DROP TABLE')) {
          await pool.query(statement);
          const tableName = statement.match(/DROP TABLE (?:IF EXISTS )?`?(\w+)`?/i)[1];
          console.log(`✅ Dropped table: ${tableName}`);
        } else if (statement.toUpperCase().includes('ALTER TABLE')) {
          await pool.query(statement);
          console.log(`✅ Altered orders table - removed unused columns`);
        } else {
          await pool.query(statement);
          console.log(`✅ Statement executed`);
        }
      } catch (error) {
        if (error.code === 'ER_BAD_FIELD_ERROR' || error.code === 'ER_CANT_DROP_FIELD_OR_KEY') {
          console.log(`⚠️  Column already removed or doesn't exist`);
        } else if (error.code === 'ER_BAD_TABLE_ERROR') {
          console.log(`⚠️  Table doesn't exist (already removed)`);
        } else {
          console.error(`❌ Error: ${error.message}`);
          throw error;
        }
      }
    }

    // Show remaining tables
    const [tables] = await pool.query('SHOW TABLES');
    console.log(`\n📊 Remaining tables: ${tables.length}`);
    tables.forEach((table, index) => {
      const tableName = Object.values(table)[0];
      console.log(`  ${index + 1}. ${tableName}`);
    });

    console.log('\n✅ Database cleanup completed successfully!');
    console.log('Removed: addresses, coupons, coupon_usage tables');
    console.log('Removed columns: address_id, coupon_code, discount_amount from orders');
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Cleanup failed:', error.message);
    console.error(error);
    process.exit(1);
  }
}

// Run cleanup
cleanupDatabase();
