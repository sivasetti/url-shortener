const {Queue} = require('bullmq');

const clickQueue = new Queue('clicks', {
    connection : {host : 'localhost', port : 6379},
});


module.exports = clickQueue;