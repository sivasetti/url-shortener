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


async function findStatsByShortCode(code) {
    const result = await pool.query(
        `SELECT short_code, long_url, click_count, created_at
        FROM urls
        WHERE short_code = $1
        `,[code]
    );

    return result.rows[0] || null;
}

async function incrementClickCount(code) {
    await pool.query(
        `UPDATE urls SET click_count = click_count+1 WHERE short_code = $1`, [code]
    );
}


module.exports = {
    findByShortCode,
    createUrl,
    setShortCode,
    incrementClickCount,
    findStatsByShortCode,
};