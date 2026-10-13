const {Worker} = require('bullmq');
const pool = require('../lib/db');
const { Connection } = require('pg');
const urlRepository = require('../repositories/urlRepository');
const clickRepository = require('../repositories/clickRepository');

const worker = new Worker('clicks', async (job) => {
    const {code} = job.data;

    await urlRepository.incrementClickCount(code);
    await clickRepository.recordClick(code);
        
    console.log('Counted a click for', code);
}, 
{
    connection : { host : 'localhost', port : 6379},
});

console.log('Click worker running - waiting for notes...');
