const express = require('express');
const urlService = require('../services/urlService');

const router = express.Router();


router.get('/:code', async (req, res) => {
    const {code} = req.params;

    const longUrl = await urlService.resolveUrl(code);

    if (!longUrl){
        return res.status(404).json({error : `Short url not found`});
    }

    res.redirect(302, longUrl);
});  


module.exports = router;