const {google} = require("googleapis");
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

function normalizeEventsStart(event){
    const raw = event.start?.dateTime || event.start?.date;

    if(!raw) return null;

    const date = new Date(raw);

    if( Number.isNaN(date.getTime()) ) return null;

    return {
        date,
        timestamp: date.getTime(),
        iso: date.toISOString(),
        isAllDay: Boolean(!event.start?.dateTime && event.start?.date),// have to do functionality later
    };
}

function playSound() {
    const soundPath = path.join(__dirname, "sounds", "Skillet_Monster.mp3");
    if (!fs.existsSync(soundPath)) {
        console.error("No such sounds exist");
        return;
    }
    player.play(soundPath, (err) =>{
        if (err) {
            console.error("cannot play Skillet_Monster: ", err.message);
        }
    });
}

function alarm(event){
    console.log(`Alarm: ${event.summary}, ${event.start?.dateTime || event.start?.date}`);
    playSound();
}

async function checkEvents(calendar){

    const response = await calendar.events.list(
        {
            calendarId: process.env.CALENDAR_ID,
            timeMin: new Date().toISOString(),
            maxResults: 20,
            singleEvents: true,
            orderBy: "startTime",
        }
    )
    const events = response.data.items || [];

    console.log("events in checkEvents:", events.length);


    const now = Date.now();
    const interval = 60_000;
    for(const event of events){
        const normalized = normalizeEventsStart(event);

        if(normalized && now <= normalized.timestamp && normalized.timestamp <= now + interval && !worked.has((event.id || "no_id") + "_" + normalized.timestamp)) {
            alarm(event);
            worked.add((event.id || "no_id") + "_" + normalized.timestamp);
            return;
        }
    }
}


async function main() {
    console.log("Calendar alarm app started");
    const missing = requiredEnv.filter((name) => !process.env[name]);
    if(missing.length > 0) {
        throw new Error("Missing env variables: " + missing.join(", "));
    }
    console.log("Config loaded successfully")

    const auth = createAuthClient();
    console.log('auth client created successfully');


    const calendar = google.calendar({version: "v3", auth});

    await checkEvents(calendar);
    setInterval(async () => {
        try {
            await checkEvents(calendar);
        } catch (e) {
            console.error("There was a problem with an error: ", e.message);
        }
    }, 60_000);
    setInterval(() => {
        worked.clear();
    }, 86_400_000);
}

main().catch((error) => {
    console.error("Fatal error:", error.message);
    process.exit(1);
});




