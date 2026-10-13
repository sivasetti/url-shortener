const pool = require('../lib/db');

async function findClicksByDay(code) {
    const result = await pool.query(
        `SELECT DATE(clicked_at) AS day, COUNT(*) AS clicks
        FROM clicks
        WHERE short_code = $1
        GROUP BY day
        ORDER BY day`, [code]
    );

    return result.rows;
}

async function recordClick(code) {
    await pool.query(
        `INSERT INTO clicks (short_code) VALUES ($1)`, [code]);
}

    
module.exports = {
    findClicksByDay,
    recordClick
}