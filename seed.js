const pool = require('./db');
const {encode} = require('./src/lib/base62');

async function seed() {
    const TOTAL = 100000;
    const BATCH = 1000;

    const start = await pool.query(`SELECT COALESCE(max(id), 0) AS max FROM urls`);
    let nextId = Number(start.rows[0].max) + 1;

    for (let done = 0; done < TOTAL; done += BATCH ){
        const values = [];
        const params = [];
    

        for (let i = 0; i < BATCH; i++){
            const id = nextId++;
            params.push(id, encode(id), `https://example.com/page-${id}`);
            const n = params.length/3;
            values.push(`($${n * 3 - 2}, $${n * 3 - 1}, $${n * 3})`);
        }

        await pool.query(
        `   INSERT INTO urls (id, short_code, long_url) VALUES ${values.join(',')}`, params
        );
        console.log(`Seeded ${done + BATCH}/${TOTAL}`);
    }      
    
    await pool.query(`SELECT setval('urls_id_seq', (SELECT MAX(id) FROM urls))`);
    console.log(`Done - 100,000 links seeded`);
    await pool.end();
}

seed();