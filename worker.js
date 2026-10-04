const {Worker} = require('bullmq');
const pool = require('./db');
const { Connection } = require('pg');

const worker = new Worker('clicks', async (job) => {
    const {code} = job.data;
    await pool.query(
        `UPDATE urls SET click_count = click_count + 1 WHERE short_code = $1`, [code]
    );

    await pool.query(`
        INSERT INTO clicks (short_code) VALUES ($1)
        `, [code]);
        
    console.log('Counted a click for', code);
}, 
{
    connection : { host : 'localhost', port : 6379},
});

console.log('Click worker running - waiting for notes...');
