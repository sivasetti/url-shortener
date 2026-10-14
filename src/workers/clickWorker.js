const {Worker} = require('bullmq');
const { Connection } = require('pg');
const clickService = require('../services/clickService');

const worker = new Worker('clicks', async (job) => {
    const {code} = job.data;

    await clickService.recordClick(code);

    console.log('Counted a click for', code);
}, 
{
    connection : { host : 'localhost', port : 6379},
});

console.log('Click worker running - waiting for notes...');
