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

async function recordClick(code, clickedAt) {
    await pool.query(
        `INSERT INTO clicks (short_code, clicked_at) VALUES ($1, $2)`, [code, clickedAt]);
}

    
module.exports = {
    findClicksByDay,
    recordClick
}