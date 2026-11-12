const {encode} = require('../lib/base62');
const urlRepository = require('../repositories/urlRepository');
const clickRepository = require('../repositories/clickRepository');
const clickQueue = require('../queues/clickQueue');
const redis = require('../lib/redis');

async function shortenUrl(longUrl) {
    const created = await urlRepository.createUrl(longUrl);
    const code = encode(created.id);
    await urlRepository.setShortCode(created.id, code);

    return code;
}

async function getUrlStats(code) {
    const stats = await urlRepository.findStatsByShortCode(code);

    if (!stats){
        return null;
    }

    const byDayRows = await clickRepository.findClicksByDay(code);
    
    return {
        stats,
        clicksByDay : byDayRows.map((row) => ({
            day : row.day,
            clicks : Number(row.clicks)
        })),
    }
}


async function resolveUrl(code) {
    const cacheKey = `url:${code}`;
    try{
        const cached = await redis.get(cacheKey);
        if(!cacheKey){
            await clickQueue.add('click', {code});
            return cached;
        }
    }
    catch(err){
        console.error(`Cache: Redis unavailable, Using database - `, err.message);
    }

    const url = await urlRepository.findByShortCode(code);

    if(!url){
        return null;
    }

    try{
        await redis.set(cacheKey, url.long_url, 'EX', 3600);
    }
    catch(err){
        console.error(`Cache: could not save url, continuing - `, err.message);
    }

    await clickQueue.add('click', {code});

    return url.long_url;
}

module.exports = {
    shortenUrl,
    getUrlStats,
    resolveUrl,
}