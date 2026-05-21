const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();
const { getEvents, updateSound, setFlag, getCalendarsList } = require('../calendar');

router.get('/events', (req, res) => {
    return res.json({ events: getEvents() });
});

router.get('/health', (req, res) => {
    return res.json({ status: 'ok', message: 'API router works' });
})


router.get('/sounds', (req, res) => {
    const dir = path.join(__dirname, '..', 'sounds');
    try {
        const files = fs.readdirSync(dir).filter((f) => f.endsWith('.mp3')).map((f) => ({ name: f }));
        return res.json({ arr: files });
    } catch (e) {
        return res.json({ arr: [{ name: 'Skillet_Monster.mp3' }] });
    }
})
router.post('/test-sound', (req, res) => {
    return res.json({ status: 'ok' });
})


router.post('/alarm-settings', (req, res) => {
    updateSound(req.body);
    console.log("[INFO] Default sound settings updated: ", req.body);
    return res.json({ status: 'ok' });

});

router.get('/calendars', async (req, res) => {
    try {
        const calendars = await getCalendarsList();
        return res.json({ calendars: calendars });
    } catch (e) {
        console.error('[ERROR] Failed to fetch calendars: ', e.message);
        return res.status(500).json({ error: 'Failed to fetch calendars' })
    }
})



router.post('/sync', (req, res) => {
    setFlag(req.body.active);
    return res.json({ status: 'ok' });
});



module.exports = router;