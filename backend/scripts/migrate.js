// Script to create database tables
const fs = require('fs');
const path = require('path');
const { pool } = require('../src/config/database');

async function runMigration() {
  try {
    console.log('🚀 Starting database migration...\n');

    // Read SQL file
    const sqlFilePath = path.join(__dirname, '../src/database/schema.sql');
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');

    // Split SQL statements by semicolon but keep multi-line statements together
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
      
      // Skip SELECT messages
      if (statement.includes("SELECT 'All tables created successfully!'")) {
        continue;
      }

      // Skip USE database command
      if (statement.toUpperCase().startsWith('USE ')) {
        continue;
      }

      try {
        await pool.query(statement);
        
        // Extract table name from CREATE TABLE statement
        const tableMatch = statement.match(/CREATE TABLE (?:IF NOT EXISTS )?`?(\w+)`?/i);
        if (tableMatch) {
          console.log(`✅ Created table: ${tableMatch[1]}`);
        }
      } catch (error) {
        // Ignore "table already exists" errors
        if (error.code === 'ER_TABLE_EXISTS_ERROR') {
          const tableMatch = statement.match(/CREATE TABLE (?:IF NOT EXISTS )?`?(\w+)`?/i);
          if (tableMatch) {
            console.log(`⚠️  Table already exists: ${tableMatch[1]}`);
          }
        } else {
          console.error(`❌ Error executing statement: ${error.message}`);
          // Continue with other statements
        }
      }
    }

    console.log('\n✅ Database migration completed successfully!');
    
    // Show created tables
    const [tables] = await pool.query('SHOW TABLES');
    console.log(`\n📊 Total tables in database: ${tables.length}`);
    console.log('\nTables:');
    tables.forEach((table, index) => {
      const tableName = Object.values(table)[0];
      console.log(`  ${index + 1}. ${tableName}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    process.exit(1);
  }
}

// Run migration
runMigration();
