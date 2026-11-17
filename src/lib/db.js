const {Pool} = require('pg');

const pool = new Pool({
    connectionString : process.env.DATABASE_URL || 'postgres://shortener:shortener@localhost:5432/shortener',
    max : 20
});

pool.withTransaction = async (work) => {
    const client =  await pool.connect();
    try{
        await client.query('BEGIN');
        const result = await work(client);
        await client.query('COMMIT');
        return result
    }
    catch (err){
        await client.query('ROLLBACK');
        throw err;
    }
    finally{
        client.release();
    }
}


module.exports = pool;