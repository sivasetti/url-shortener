const {encode} = require('../lib/base62');
const urlRepository = require('../repositories/urlRepository');
const clickRepository = require('../repositories/clickRepository');
const clickQueue = require('../queues/clickQueue');


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
    const url = await urlRepository.findByShortCode(code);

    if (!url){
        return null;
    }

    await clickQueue.add('click', {code});

    return url.long_url;
}

module.exports = {
    shortenUrl,
    getUrlStats,
    resolveUrl,
}