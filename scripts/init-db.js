const { sql } = require('@vercel/postgres');
const fs = require('fs');
const path = require('path');

async function initializeDatabase() {
  try {
    console.log('🗄️ Initializing database...');
    
    // Read the schema file
    const schemaPath = path.join(__dirname, '..', 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Split into individual statements and execute
    const statements = schema
      .split(';')
      .filter(statement => statement.trim().length > 0)
      .map(statement => statement.trim());
    
    for (const statement of statements) {
      if (statement) {
        console.log(`Executing: ${statement.substring(0, 50)}...`);
        await sql.query(statement);
      }
    }
    
    console.log('✅ Database initialized successfully!');
    
    // Verify products were inserted
    const products = await sql`SELECT COUNT(*) FROM products`;
    console.log(`📦 Products in database: ${products.rows[0].count}`);
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  }
}

initializeDatabase(); 