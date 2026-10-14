const urlRepository = require('../repositories/urlRepository');
const clickRepository = require('../repositories/clickRepository');

async function recordClick(code) {
    await urlRepository.incrementClickCount(code);
    await clickRepository.recordClick(code);
}


module.exports = {
    recordClick,    
}