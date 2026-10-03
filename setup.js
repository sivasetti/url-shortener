const pool = require('./db');


async function setup() {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS urls(
        id BIGSERIAL PRIMARY KEY,
        short_code VARCHAR(10) UNIQUE,
        long_url TEXT NOT NULL,
        create_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        click_count BIGINT NOT NULL DEFAULT 0
        )
        `);
        console.log(`Table "urls" is ready`);
        await pool.end();
}
setup();