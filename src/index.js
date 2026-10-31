const express = require('express');
const app = express();

const urlsRouter = require('./routes/urls');
const redirectRouter = require('./routes/redirect');
const {metricsMiddleware, metricsHandler} = require('./lib/metrics')

app.use(express.json());
app.use(metricsMiddleware);

app.get('/metrics', metricsHandler);

app.get('/', (req, res)=>{
    res.json({
        name : `URL Shortener API`,
        status : `ok`,
        health : `GET /health`,
        shorten : `POST /api/shorten`,
        stats : `GET /api/urls/:code/stats`
    });
});

app.get('/health', (req, res)=>{
    res.json({
        status : 'ok',
    });
});

app.use(urlsRouter);
app.use(redirectRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, ()=>{
    console.log(`Server runnning on ${PORT}`);
});