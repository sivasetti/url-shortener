const {Queue} = require('bullmq');

const redisUrl = new URL(process.env.REDIS_URL || 'redis://localhost:6379');


const clickQueue = new Queue('clicks', {
    connection : {host : redisUrl.hostname, port : Number(redisUrl.port)},
});


module.exports = clickQueue;