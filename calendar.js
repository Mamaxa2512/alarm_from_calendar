const { google } = require("googleapis");
const player = require("play-sound")();
const fs = require("fs");
const path = require("path");
require("dotenv").config();
const requiredEnv = [
    "GOOGLE_CLIENT_ID",
    "GOOGLE_CLIENT_SECRET",
    "GOOGLE_REDIRECT_URI",
    "GOOGLE_REFRESH_TOKEN",
    "CALENDAR_ID",
];

const worked = new Set();
//let cachedEvents = [];

let events = [];
let defaultSound = { alarmEvents: [], volume: 70, sound: 'Skillet_Monster.mp3' }
let flag = false;

function setFlag(param) {
    flag = param;
}

//cachedEvents = [
//    { id: "1", summary: "Daily Standup Mock", start: { dateTime: new Date(Date.now() + 600000).toISOString() } },
//    { id: "2", summary: "Project Review Mock", start: { dateTime: new Date(Date.now() + 3600000).toISOString() } }
//];



async function getCalendarsList() {
    const auth = createAuthClient();
    const calendar = google.calendar({ version: "v3", auth });
    const response = await calendar.calendarList.list();

    return response.data.items;
}

function buildDedupKey(eventId, timestamp) {
    return (eventId || "no_id") + "_" + timestamp;
}

function createAuthClient() {
    const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.GOOGLE_REDIRECT_URI,
    )
    oauth2Client.setCredentials({
        refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
    });
    return oauth2Client;
}

function normalizeEventsStart(event) {
    if (!event) return null;

    const raw = event.start?.dateTime || event.start?.date;

    if (!raw) return null;

    const date = new Date(raw);

    if (Number.isNaN(date.getTime())) return null;

    return {
        date,
        timestamp: date.getTime(),
        iso: date.toISOString(),
        isAllDay: Boolean(!event.start?.dateTime && event.start?.date),// have to do functionality later
    };
}

function isEventInWindow(timestamp, now, intervalMs = 60_000) {
    return now <= timestamp && timestamp <= now + intervalMs;
}

function playSound(event) {
    if (!defaultSound.alarmEvents.includes(event.id)) {
        console.log("[INFO] Event not in alarm list");
        return;
    }
    const soundPath = path.join(__dirname, "sounds", defaultSound.sound);
    if (!fs.existsSync(soundPath)) {
        console.warn("[WARN] No such sounds exist");
        return;
    }
    player.play(soundPath, (err) => {
        if (err) {
            console.error("[ERROR] Cannot play Skillet_Monster: ", err.message);
        }
    });
}

function alarm(event) {
    console.log(`[INFO] Alarm: ${event.summary}, ${event.start?.dateTime || event.start?.date}, ${event.id}`);
    playSound(event);
}

async function checkEvents(calendar, deps = {}) {
    if (flag === false) {
        return;
    }
    const calendars = await getCalendarsList();
    const calendarsId = [];
    for (const cal of calendars) {
        calendarsId.push(cal.id);
    }
    const triggerAlarm = deps.alarm || alarm;
    const workedSet = deps.worked || worked;
    const nowValue = deps.now ?? Date.now();

    const allEvents = [];

    for (const calId of calendarsId) {

        const buf = await calendar.events.list(
            {
                calendarId: calId,
                timeMin: new Date(nowValue).toISOString(),
                timeMax: new Date(nowValue + 3_600_000).toISOString(),  // check events for the next hour
                maxResults: 20,
                singleEvents: true,
                orderBy: "startTime",
            }
        )

        const al = buf.data.items || [];
        allEvents.push(al.map((event) => { return { ...event, calendarId: calId } }));
    }

    events = allEvents.flat();
    console.log("[INFO] Events in checkEvents:", events.length);


    const now = nowValue;
    const interval = 60_000;
    for (const event of events) {
        const normalized = normalizeEventsStart(event);
        const dedupKey = normalized ? buildDedupKey(event.id, normalized.timestamp) : null;

        if (normalized &&
            isEventInWindow(normalized.timestamp, now, interval) &&
            !workedSet.has(dedupKey)) { // if there are multiple events in the same minute, we will only alarm for the first one
            triggerAlarm(event);
            workedSet.add(dedupKey);
            return;
        }
    }
}

function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}


async function exponentialRetry(task, retries = 5, initialDelay = 1000) {
    let currentDelay = initialDelay;

    for (let i = 0; i < retries; i++) {
        try {
            return await task();
        } catch (err) {
            if (i === retries - 1) throw err;
            console.log(`[ERROR] restart after ${currentDelay}ms...`);

            await delay(currentDelay);
            currentDelay *= 2;
        }
    }
}


async function startPolling() {
    console.log("[INFO] Calendar alarm app started");
    const missing = requiredEnv.filter((name) => !process.env[name]);
    if (missing.length > 0) {
        throw new Error("Missing env variables: " + missing.join(", "));
    }
    console.log("[INFO] Config loaded successfully")

    const auth = createAuthClient();
    console.log('[INFO] Auth client created successfully');

    const calendar = google.calendar({ version: "v3", auth });

    exponentialRetry(() => checkEvents(calendar)).catch((e) => {
        console.error("[ERROR] Failed to check events after multiple retries: ", e.message);
    });

    setInterval(async () => {
        try {
            await checkEvents(calendar);
        } catch (e) {
            console.error("[ERROR] There was a problem with an error: ", e.message);
        }
    }, 60_000);
    setInterval(() => {
        worked.clear();
    }, 86_400_000);
}

function getEvents() {
    return events;
}

function updateSound(newSound) {
    defaultSound = newSound;
}

module.exports = {
    normalizeEventsStart,
    isEventInWindow,
    buildDedupKey,
    checkEvents,
    getEvents,
    updateSound,
    startPolling,
    setFlag,
    getCalendarsList
};







