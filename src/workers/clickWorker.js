const {Worker} = require('bullmq');
const clickService = require('../services/clickService');
const redisUrl = new URL(process.env.REDIS_URL || 'redis://localhost:6379');




const worker = new Worker('clicks', async (job) => {
    const {code} = job.data;

    await clickService.recordClick(code);

    console.log('Counted a click for', code);
}, 
{
    connection : { host : redisUrl.hostname, port : Number(redisUrl.port)},
});

console.log('Click worker running - waiting for notes...');
