const fs = require('fs');
const path = require('path');
const pool = require('../src/lib/db');


async function setup() {
    try{
        const schemaPath = path.join(__dirname, '..', 'db', 'schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');

        await pool.query(schema);
        console.log('Database schema is ready');
    }   
    catch(error){
        console.error('Database setup failed:', error.message);
        process.exitCode = 1;
    } 
    finally{
        await pool.end();
    }
}
setup();