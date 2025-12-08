const fs = require('fs');
const path = require('path');
const { pool } = require('../src/config/database');

async function runMigration() {
  try {
    console.log('🚀 Starting migration: Simplify order status...\n');

    // Read migration file
    const migrationPath = path.join(__dirname, '..', 'src', 'database', 'migrations', '003_simplify_order_status.sql');
    console.log('📖 Reading migration file:', migrationPath);
    const sqlContent = fs.readFileSync(migrationPath, 'utf8');

    // Split SQL statements by semicolon
    const statements = [];
    let currentStatement = '';
    
    const lines = sqlContent.split('\n');
    for (const line of lines) {
      const trimmedLine = line.trim();
      
      // Skip comments and empty lines
      if (trimmedLine.startsWith('--') || 
          trimmedLine.startsWith('/*') || 
          trimmedLine.startsWith('*') ||
          trimmedLine.length === 0) {
        continue;
      }
      
      currentStatement += ' ' + trimmedLine;
      
      // If line ends with semicolon, it's end of statement
      if (trimmedLine.endsWith(';')) {
        statements.push(currentStatement.trim().replace(/;$/, ''));
        currentStatement = '';
      }
    }

    console.log(`📝 Found ${statements.length} SQL statements to execute\n`);

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      // Skip SELECT messages and USE database command
      if (statement.includes("SELECT 'Order status simplified") || 
          statement.toUpperCase().startsWith('USE ')) {
        continue;
      }

      try {
        console.log(`🔄 Executing statement ${i + 1}...`);
        
        if (statement.toUpperCase().includes('UPDATE ORDERS')) {
          const [result] = await pool.query(statement);
          console.log(`✅ Updated ${result.affectedRows} orders`);
        } else if (statement.toUpperCase().includes('ALTER TABLE')) {
          await pool.query(statement);
          console.log(`✅ Altered orders table`);
        } else if (statement.toUpperCase().includes('SELECT')) {
          const [result] = await pool.query(statement);
          console.log(`\n📊 Current order status distribution:`);
          result.forEach(row => {
            console.log(`   ${row.order_status}: ${row.count} orders`);
          });
        } else {
          await pool.query(statement);
          console.log(`✅ Statement executed`);
        }
      } catch (error) {
        console.error(`❌ Error executing statement: ${error.message}`);
        throw error;
      }
    }

    console.log('\n✅ Migration completed successfully!');
    console.log('Order status is now limited to: preparing, delivered, cancelled');
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.error(error);
    process.exit(1);
  }
}

// Run migration
runMigration();
