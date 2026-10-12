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

    
module.exports = {
    findClicksByDay
}