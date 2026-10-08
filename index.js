const express = require('express');
const app = express();

const pool = require('./src/lib/db');

const clickQueue = require('./src/queues/clickQueue');

const urlsRouter = require('./src/routes/urls');
const redirectRouter = require('./src/routes/redirect');

app.use(express.json());

app.get('/health', (req, res)=>{
    res.json({
        status : 'ok',
    });
});

app.use(urlsRouter);
app.use(redirectRouter);


app.listen(3000, ()=>{
    console.log(`Server runnning on 3000`);
});