const Redis = require('ioredis');
const r = new Redis(process.env.REDIS_URL, {
    connectTimeout : 8000,
    maxRetriesRequest : 1,
    retryStrategy : () => null,
});

r.on('error', (e) => console.log('CONN ERROR:', e.message));
r.ping()
    .then((x) => { console.log('PING ->', x); process.exit(0); })
    .catch((e) => { console.log('PING FAILED :', e.message); process.exit(1); 
        
    });