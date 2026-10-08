const express = require('express');
const app = express();

const pool = require('./lib/db');

const clickQueue = require('./queues/clickQueue');

const urlsRouter = require('./routes/urls');
const redirectRouter = require('./routes/redirect');

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