const express = require('express');
const ratelimit = require('../middleware/ratelimit');
const urlService = require('../services/urlService');



const router = express.Router();

router.post('/api/shorten', ratelimit,  async (req, res) => {
    const {longUrl} = req.body;
    let parsed;
    try{
        parsed = new URL(longUrl);
    }
    catch{
        return res.status(400).json({
            error : 'Please send a valid URL'
        });
    }

    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:'){
        return res.status(400).json({error : "Only http and https URLs are allowed"});
    }
    
    const code = await urlService.shortenUrl(longUrl);

    
    res.status(201).json({
        shortCode : code,
        shortUrl : `${process.env.BASE_URL || 'http://localhost:3000'}/${code}`,
    });
});

   

router.get('/api/urls/:code/stats', async (req, res) => {
    const {code} = req.params;

    const result = await urlService.getUrlStats(code);

    if (!result){
        return res.status(404).json({error : "Short url not found"});
    }
    res.json({
        shortCode : result.stats.short_code,
        longUrl : result.stats.long_url, 
        createdAt : result.stats.created_at,
        totalClicks : Number(result.stats.click_count),
        clicksByDay : result.clicksByDay,
    });
});


module.exports = router;