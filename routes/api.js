const express = require('express');

const router = express.Router();
const {getCachedEvents} = require('../calendar');

router.get('/events', (req, res) => {
    return res.json({events: getCachedEvents()});
});

router.get('/status', (req, res) => {
    return res.json({status: 'ok', message: 'API router works'});
})


router.get('/sounds', (req, res) => {
    return res.json({arr: [{name: 'Skillet_Monster.mp3'}]});
})

module.exports = router;