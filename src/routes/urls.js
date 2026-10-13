const express = require('express');
const ratelimit = require('../middleware/ratelimit');
const urlRepository = require('../repositories/urlRepository'); 
const clickRepository = require('../repositories/clickRepository');
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
        shortUrl : `http://localhost:3000/${code}`,
    });
});

   

router.get('/api/urls/:code/stats', async (req, res) => {
    const {code} = req.params;

    const stats = await urlRepository.findByShortCode(code);

    if (!stats){
        return res.status(404).json({
            error : "Short url not found"
        });
    }

    const byDay = await clickRepository.findClicksByDay(code);


    // const row = result.rows[0];
    res.json({
        shortCode : byDay.short_code,
        longUrl : byDay.long_url, 
        createdAt : byDay.created_at,
        totalClicks : Number(byDay.click_count),
        clicksByDay : byDay.map(row => ({ day : row.day, clicks : Number(row.clicks)})),
    });
});


module.exports = router;