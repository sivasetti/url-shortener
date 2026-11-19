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

async function recordClick(code, clickedAt, eventId, db = pool) {
    const result = await db.query(
        `INSERT INTO clicks (short_code, clicked_at, event_id) VALUES ($1, $2, $3) 
        ON CONFLICT (event_id) DO NOTHING RETURNING id`, [code, clickedAt, eventId || null]);
    return result.rows.length > 0;
}

    
module.exports = {
    findClicksByDay,
    recordClick
}