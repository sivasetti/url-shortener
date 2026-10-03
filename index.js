const express = require('express');
const app = express();

const pool = require('./db');
const {encode} = require('./base62');

const ratelimit = require('./ratelimit');

app.use(express.json());

app.get('/health', (req, res)=>{
    res.json({
        status : 'ok',
    });
});


app.post('/api/shorten', ratelimit,  async (req, res) => {
    const {longUrl} = req.body;
    let parsed;
    try{
        parsed = new URL(longUrl);
    }
    catch{
        return res.status(400).json({
            error : 'Please send a valid URL'
        });
    }

    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:'){
        return res.status(400).json({error : "Only http and https URLs are allowed"});
    }
    
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


app.get('/:code', async (req, res) => {
    const {code} = req.params;

    const result = await pool.query(
        `SELECT long_url FROM urls WHERE short_code = $1`, [code]
    );

    if (result.rows.length === 0){
        return res.status(404).json({error : 'Short url not found'});
    }

    await pool.query(
        `UPDATE urls SET click_count = click_count + 1 WHERE short_code = $1`, [code]
    );

    res.redirect(302, result.rows[0].long_url);
});     

app.get('/api/urls/:code/stats', async (req, res) => {
    const {code} = req.params;

    const result = await pool.query(
        'SELECT short_code, long_url, created_at, click_count FROM urls WHERE short_code = $1', [code]
    );

    if (result.rows.length === 0){
        return res.status(404).json({
            error : "Short url not found"
        });
    }

    const row = result.rows[0];
    res.json({
        shortCode : row.short_code,
        longUrl : row.long_url, 
        createdAt : row.created_at,
        totalClicks : Number(row.click_count),
    });
})


app.listen(3000, ()=>{
    console.log(`Server runnning on 3000`);
});