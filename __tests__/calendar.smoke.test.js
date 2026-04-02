const test = require("node:test");
const assert = require("node:assert/strict");

const { checkEvents } = require("../calendar");

test("smoke: checkEvents calls calendar.events.list and triggers alarm for relevant event", async () => {
    const now = Date.parse("2026-04-02T10:00:00.000Z");
    process.env.CALENDAR_ID = "test-calendar-id";

    let listCalled = false;
    let listArgs = null;
    const calendar = {
        events: {
            list: async (args) => {
                listCalled = true;
                listArgs = args;
                return {
                    data: {
                        items: [
                            {
                                id: "event-1",
                                summary: "test",
                                start: { dateTime: new Date(now + 30_000).toISOString() },
                            },
                        ],
                    },
                };
            },
        },
    };

    let alarmCalls = 0;
    const worked = new Set();

    await checkEvents(calendar, {
        now,
        worked,
        alarm: () => {
            alarmCalls += 1;
        },
    });

    assert.equal(listCalled, true);
    assert.equal(alarmCalls, 1);
    assert.ok(listArgs);
    assert.equal(listArgs.calendarId, "test-calendar-id");
    assert.equal(listArgs.singleEvents, true);
    assert.equal(listArgs.orderBy, "startTime");
});

test("smoke: checkEvents does not trigger alarm for non-relevant event", async () => {
    const now = Date.parse("2026-04-02T10:00:00.000Z");

    const calendar = {
        events: {
            list: async () => ({
                data: {
                    items: [
                        {
                            id: "event-2",
                            summary: "future",
                            start: { dateTime: new Date(now + 120_000).toISOString() },
                        },
                    ],
                },
            }),
        },
    };

    let alarmCalls = 0;

    await checkEvents(calendar, {
        now,
        worked: new Set(),
        alarm: () => {
            alarmCalls += 1;
        },
    });

    assert.equal(alarmCalls, 0);
});

