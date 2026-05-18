const express = require('express');

const router = express.Router();
const { getEvents } = require('../calendar');

router.get('/events', (req, res) => {
    return res.json({ events: getEvents() });
});

router.get('/health', (req, res) => {
    return res.json({ status: 'ok', message: 'API router works' });
})


router.get('/sounds', (req, res) => {
    return res.json({ arr: [{ name: 'Skillet_Monster.mp3' }] });
})
router.post('/test-sound', (req, res) => {
    return res.json({ status: 'ok' });
})

module.exports = router;