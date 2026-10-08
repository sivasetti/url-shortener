const redis = require('../lib/redis');

const CAPACITY = 5; // MAX REQUESTS/BUCKET SIZE
const REFILL_PER_SECOND = 5/60; // ...PER THIS MANY SECONDS/ 100 TOKENS PER MINUTE, DRIPPING SLOWLY


const TOKEN_BUCKET_SCRIPT = `
    local key = KEYS[1]
    local capacity = tonumber(ARGV[1])
    local refill = tonumber(ARGV[2])
    local now = tonumber(ARGV[3])

    local data = redis.call('HMGET', key, 'tokens', 'ts')
    local tokens = tonumber(data[1])
    local ts = tonumber(data[2])

    if tokens == nil then
        tokens = capacity
        ts = now
    end

    local elapsed = (now - ts) / 1000
    tokens = math.min(capacity, tokens + elapsed * refill)

    local allowed = 0
    if tokens >= 1 then
        tokens = tokens - 1
        allowed = 1
    end

    redis.call('HSET', key, 'tokens', tokens, 'ts', now)
    redis.call('EXPIRE', key, 120)
    return allowed
    `;



async function ratelimit(req, res, next) {
    const key = `tb:${req.ip}`;

    const allowed = await redis.eval(
        TOKEN_BUCKET_SCRIPT,
        1,
        key,
        CAPACITY,
        REFILL_PER_SECOND,
        Date.now()
    );

    if (allowed === 0){
        return res.status(429).json({
            error : 'Too many requests - slow down'
        });
    }
    next();
}


module.exports = ratelimit;