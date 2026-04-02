const test = require("node:test");
const assert = require("node:assert/strict");

const {
    normalizeEventsStart,
    isEventInWindow,
    buildDedupKey,
} = require("../calendar");

const validDateTimeCases = [];
for (let i = 0; i < 40; i++) {
    const minute = String(i % 60).padStart(2, "0");
    validDateTimeCases.push(`2026-04-02T10:${minute}:00.000Z`);
}

validDateTimeCases.forEach((dateTime, i) => {
    test(`normalizeEventsStart dateTime case #${i + 1}`, () => {
        const event = { start: { dateTime } };
        const result = normalizeEventsStart(event);

        assert.ok(result);
        assert.equal(result.isAllDay, false);
        assert.equal(result.timestamp, Date.parse(dateTime));
        assert.equal(result.iso, new Date(dateTime).toISOString());
    });
});

const validDateCases = [];
for (let d = 1; d <= 30; d++) {
    validDateCases.push(`2026-04-${String(d).padStart(2, "0")}`);
}

validDateCases.forEach((date, i) => {
    test(`normalizeEventsStart all-day date case #${i + 1}`, () => {
        const event = { start: { date } };
        const result = normalizeEventsStart(event);

        assert.ok(result);
        assert.equal(result.isAllDay, true);
        assert.equal(result.timestamp, Date.parse(date));
    });
});

[
    { start: { dateTime: "not-a-date" } },
    { start: { dateTime: "2026-99-99T10:00:00.000Z" } },
    { start: { dateTime: "" } },
    { start: { date: "not-a-date" } },
    { start: { date: "2026-15-01" } },
    { start: {} },
    { start: null },
    {},
    null,
    undefined,
].forEach((event, i) => {
    test(`normalizeEventsStart invalid/missing case #${i + 1}`, () => {
        assert.equal(normalizeEventsStart(event), null);
    });
});

test("normalizeEventsStart prioritizes dateTime over date", () => {
    const event = {
        start: {
            dateTime: "2026-04-02T10:15:00.000Z",
            date: "2026-04-30",
        },
    };

    const result = normalizeEventsStart(event);
    assert.ok(result);
    assert.equal(result.isAllDay, false);
    assert.equal(result.timestamp, Date.parse("2026-04-02T10:15:00.000Z"));
});

const now = 1_000_000;
for (let i = 0; i <= 20; i++) {
    const ts = now + i * 3_000;
    test(`isEventInWindow inside range case #${i + 1}`, () => {
        assert.equal(isEventInWindow(ts, now), true);
    });
}

for (let i = 1; i <= 15; i++) {
    const before = now - i;
    const after = now + 60_000 + i;
    test(`isEventInWindow before range case #${i}`, () => {
        assert.equal(isEventInWindow(before, now), false);
    });
    test(`isEventInWindow after range case #${i}`, () => {
        assert.equal(isEventInWindow(after, now), false);
    });
}

for (let i = 1; i <= 10; i++) {
    const intervalMs = i * 1000;
    test(`isEventInWindow custom interval boundary case #${i}`, () => {
        assert.equal(isEventInWindow(now + intervalMs, now, intervalMs), true);
    });
}

for (let i = 1; i <= 10; i++) {
    const intervalMs = i * 1000;
    test(`isEventInWindow custom interval outside case #${i}`, () => {
        assert.equal(isEventInWindow(now + intervalMs + 1, now, intervalMs), false);
    });
}

for (let i = 1; i <= 20; i++) {
    const id = `event_${i}`;
    const timestamp = i * 10_000;
    test(`buildDedupKey normal id case #${i}`, () => {
        assert.equal(buildDedupKey(id, timestamp), `${id}_${timestamp}`);
    });
}

[undefined, null, "", 0, false].forEach((fallbackId, i) => {
    test(`buildDedupKey fallback id case #${i + 1}`, () => {
        assert.equal(buildDedupKey(fallbackId, 12345), "no_id_12345");
    });
});

for (let i = 1; i <= 10; i++) {
    const timestamp = `ts_${i}`;
    test(`buildDedupKey string timestamp case #${i}`, () => {
        assert.equal(buildDedupKey("abc", timestamp), `abc_${timestamp}`);
    });
}

