const { isPgPool } = require('bullmq');
const pool = require('../lib/db');

async function findByShortCode(code) {
    const result = await pool.query(
        `SELECT long_url FROM urls WHERE short_code = $1`,[code]
    );

    return result.rows[0] || null;
}


module.exports = {
    findByShortCode
};