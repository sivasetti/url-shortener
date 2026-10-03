const redis = require('./redis');

const LIMIT = 5; // MAX REQUESTS
const WINDOW_SECONDS = 60; // ...PER THIS MANY SECONDS

async function ratelimit(req, res, next) {
    const key = `rl:${req.ip}`;

    const count = await redis.incr(key);

    if (count === 1){
        await redis.expire(key, WINDOW_SECONDS);
    }

    if (count > LIMIT){
        return res.status(429).json({error : `Too many requests - slow down`});
    }

    next();
}


module.exports = ratelimit;