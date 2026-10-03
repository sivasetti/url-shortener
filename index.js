const express = require('express');
const app = express();

const pool = require('./db');
const {encode} = require('./base62');

app.use(express.json());

app.get('/health', (req, res)=>{
    res.json({
        status : 'ok'
    });
});


app.post('/api/shorten', async (req, res) => {
    const {longUrl} = req.body;
    
    const result = await pool.query(
        `INSERT INTO urls (long_url) VALUES ($1) RETURNING id`,
        [longUrl]
    );

    const id = Number(result.rows[0].id);
    const code = encode(id);
    
    await pool.query(`UPDATE urls SET short_code = $1 WHERE id = $2`, [code, id]);

    res.status(201).json({
        shortCode : code,
        shortUrl : `http://localhost:3000/${code}`,
    });
});



app.listen(3000, ()=>{
    console.log(`Server runnning on 3000`);
});