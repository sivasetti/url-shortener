const { isPgPool } = require('bullmq');
const pool = require('../lib/db');

async function findByShortCode(code) {
    const result = await pool.query(
        `SELECT long_url FROM urls WHERE short_code = $1`,[code]
    );

    return result.rows[0] || null;
}


async function createUrl(longUrl) {
    const result = await pool.query(
        `INSERT INTO urls(long_url) VALUES ($1) RETURNING id`, [longUrl]
    );

    return result.rows[0];
}


async function setShortCode(id, shortCode) {
    await pool.query(
        `UPDATE urls SET short_code = $1 WHERE id = $2`, [shortCode, id]
    )
}


module.exports = {
    findByShortCode,
    createUrl,
    setShortCode
};