const {encode} = require('../lib/base62');
const urlRepository = require('../repositories/urlRepository');


async function shortenUrl(longUrl) {
    const created = await urlRepository.createUrl(longUrl);
    const code = encode(created.id);
    await urlRepository.setShortCode(created.id, code);

    return code;
}


module.exports = {
    shortenUrl,
}