const express = require('express');
const urlRepository = require('../repositories/urlRepository');
const clickQueue = require('../queues/clickQueue');

const router = express.Router();


router.get('/:code', async (req, res) => {
    const {code} = req.params;

    const url = await urlRepository.findByShortCode(code);

    await clickQueue.add('click', {code});

    res.redirect(302, url.long_url);
});  


module.exports = router;