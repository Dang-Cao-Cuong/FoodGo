// Script to seed database with sample data
const fs = require('fs');
const path = require('path');
const { pool } = require('../src/config/database');

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...\n');

    // Read SQL file
    const sqlFilePath = path.join(__dirname, '../src/database/seed.sql');
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');

    // Split and execute statements
    const statements = [];
    let currentStatement = '';
    
    const lines = sqlContent.split('\n');
    for (const line of lines) {
      const trimmedLine = line.trim();
      
      if (trimmedLine.startsWith('--') || 
          trimmedLine.length === 0) {
        continue;
      }
      
      currentStatement += ' ' + trimmedLine;
      
      if (trimmedLine.endsWith(';')) {
        statements.push(currentStatement.trim().replace(/;$/, ''));
        currentStatement = '';
      }
    }

    console.log(`📝 Executing ${statements.length} statements...\n`);

    for (const statement of statements) {
      if (statement.toUpperCase().startsWith('USE ')) {
        continue;
      }

      try {
        await pool.query(statement);
        
        if (statement.toUpperCase().includes('INSERT INTO')) {
          const tableMatch = statement.match(/INSERT INTO\s+(\w+)/i);
          if (tableMatch) {
            console.log(`✅ Inserted data into: ${tableMatch[1]}`);
          }
        } else if (statement.toUpperCase().includes('SELECT')) {
          const [result] = await pool.query(statement);
          if (result.length > 0 && result[0].message) {
            console.log(`\n📊 ${result[0].message}`);
          } else if (result.length > 0) {
            console.log('\n📊 Summary:');
            console.log(result[0]);
          }
        }
      } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
          console.log(`⚠️  Duplicate entry, skipping...`);
        } else {
          console.error(`❌ Error: ${error.message}`);
        }
      }
    }

    console.log('\n✅ Database seeding completed!\n');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Seeding failed:', error.message);
    process.exit(1);
  }
}

seedDatabase();
