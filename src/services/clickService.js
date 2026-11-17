const urlRepository = require('../repositories/urlRepository');
const clickRepository = require('../repositories/clickRepository');

async function recordClick(code, clickedAt) {
    await pool.withTransaction(async (client) => {
    await urlRepository.incrementClickCount(code, client);
    await clickRepository.recordClick(code, clickedAt || new Date().toISOString(), client);
    });
}


module.exports = {
    recordClick,    
}