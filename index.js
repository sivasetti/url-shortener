const express = require('express');
const app = express();

const pool = require('./src/lib/db');

const clickQueue = require('./src/queues/clickQueue');

const urlsRouter = require('./src/routes/urls');

app.use(express.json());

app.get('/health', (req, res)=>{
    res.json({
        status : 'ok',
    });
});

app.use(urlsRouter);

app.get('/:code', async (req, res) => {
    const {code} = req.params;

    const result = await pool.query(
        `SELECT long_url FROM urls WHERE short_code = $1`, [code]
    );

    if (result.rows.length === 0){
        return res.status(404).json({error : 'Short url not found'});
    }

    // await pool.query(
    //     `UPDATE urls SET click_count = click_count + 1 WHERE short_code = $1`, [code]
    // );

    await clickQueue.add('click', {code});

    res.redirect(302, result.rows[0].long_url);
});  



app.listen(3000, ()=>{
    console.log(`Server runnning on 3000`);
});