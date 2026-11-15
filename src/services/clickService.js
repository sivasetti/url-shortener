const urlRepository = require('../repositories/urlRepository');
const clickRepository = require('../repositories/clickRepository');

async function recordClick(code, clickedAt) {
    await urlRepository.incrementClickCount(code);
    await clickRepository.recordClick(code, clickedAt || new Date().toISOString());
}


module.exports = {
    recordClick,    
}