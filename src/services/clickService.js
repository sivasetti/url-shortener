const urlRepository = require('../repositories/urlRepository');
const clickRepository = require('../repositories/clickRepository');
const pool = require('../lib/db');

async function recordClick(code, clickedAt, eventId) {
    await pool.withTransaction(async (client) => {
        const inserted = await clickRepository.recordClick(code, clickedAt || new Date().toISOString(), eventId, client);
        if (inserted){
            await urlRepository.incrementClickCount(code, client);
        }
    });
}


module.exports = {
    recordClick,
}