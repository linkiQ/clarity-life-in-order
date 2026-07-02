// Lightweight natural-language date/time parser for quick capture.
// Recognizes phrases like "tomorrow", "today", "tonight", weekday names,
// "in 2 hours", "in 30 min", "next week", "3pm", "at 15:30", and strips
// them from the returned title.

const WEEKDAYS: Record<string, number> = {
  sunday: 0, sun: 0,
  monday: 1, mon: 1,
  tuesday: 2, tue: 2, tues: 2,
  wednesday: 3, wed: 3,
  thursday: 4, thu: 4, thurs: 4,
  friday: 5, fri: 5,
  saturday: 6, sat: 6,
};

export interface ParsedCapture {
  title: string;
  scheduledFor: number | null; // start-of-day ms
  dueAt: number | null; // specific moment ms
}

function startOfDay(ts: number) {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

export function parseNaturalDate(input: string): ParsedCapture {
  let text = ` ${input} `;
  const now = new Date();
  let day: Date | null = null;
  let time: { h: number; m: number } | null = null;

  const remove = (re: RegExp) => {
    text = text.replace(re, " ");
  };

  // "in N minutes/hours/days"
  const inMatch = text.match(/\bin\s+(\d+)\s*(minutes?|mins?|hours?|hrs?|days?|weeks?)\b/i);
  if (inMatch) {
    const n = parseInt(inMatch[1], 10);
    const unit = inMatch[2].toLowerCase();
    const d = new Date(now);
    if (unit.startsWith("min")) d.setMinutes(d.getMinutes() + n);
    else if (unit.startsWith("h")) d.setHours(d.getHours() + n);
    else if (unit.startsWith("d")) d.setDate(d.getDate() + n);
    else if (unit.startsWith("w")) d.setDate(d.getDate() + n * 7);
    day = new Date(d);
    time = { h: d.getHours(), m: d.getMinutes() };
    remove(new RegExp(inMatch[0], "i"));
  }

  // today / tomorrow / tonight / tmrw
  if (!day) {
    if (/\btoday\b/i.test(text)) { day = new Date(now); remove(/\btoday\b/i); }
    else if (/\btomorrow\b|\btmrw\b|\btmr\b/i.test(text)) {
      const d = new Date(now); d.setDate(d.getDate() + 1); day = d;
      remove(/\btomorrow\b|\btmrw\b|\btmr\b/i);
    }
    else if (/\btonight\b/i.test(text)) {
      day = new Date(now); if (!time) time = { h: 20, m: 0 };
      remove(/\btonight\b/i);
    }
    else if (/\bnext week\b/i.test(text)) {
      const d = new Date(now); d.setDate(d.getDate() + 7); day = d;
      remove(/\bnext week\b/i);
    }
  }

  // weekday (optionally "next monday")
  if (!day) {
    const wd = text.match(/\b(next\s+)?(sunday|monday|tuesday|wednesday|thursday|friday|saturday|sun|mon|tues?|wed|thurs?|fri|sat)\b/i);
    if (wd) {
      const targetDow = WEEKDAYS[wd[2].toLowerCase()];
      const d = new Date(now);
      const diff = (targetDow - d.getDay() + 7) % 7 || 7;
      d.setDate(d.getDate() + diff);
      day = d;
      remove(new RegExp(wd[0], "i"));
    }
  }

  // time: "3pm", "3:30pm", "at 15:30", "at 9"
  if (!time) {
    const tm =
      text.match(/\bat\s+(\d{1,2})(?::(\d{2}))?\s*(am|pm)?\b/i) ||
      text.match(/\b(\d{1,2})(?::(\d{2}))\s*(am|pm)?\b/i) ||
      text.match(/\b(\d{1,2})\s*(am|pm)\b/i);
    if (tm) {
      let h = parseInt(tm[1], 10);
      const m = tm[2] ? parseInt(tm[2], 10) : 0;
      const ap = (tm[3] || "").toLowerCase();
      if (ap === "pm" && h < 12) h += 12;
      if (ap === "am" && h === 12) h = 0;
      if (h >= 0 && h <= 23 && m >= 0 && m <= 59) {
        time = { h, m };
        remove(new RegExp(tm[0].replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"));
      }
    }
  }

  let scheduledFor: number | null = null;
  let dueAt: number | null = null;
  if (day) {
    if (time) {
      day.setHours(time.h, time.m, 0, 0);
      dueAt = day.getTime();
      scheduledFor = startOfDay(day.getTime());
    } else {
      scheduledFor = startOfDay(day.getTime());
    }
  } else if (time) {
    const d = new Date(now);
    d.setHours(time.h, time.m, 0, 0);
    if (d.getTime() < now.getTime()) d.setDate(d.getDate() + 1);
    dueAt = d.getTime();
    scheduledFor = startOfDay(d.getTime());
  }

  const cleaned = text.replace(/\s+/g, " ").trim();
  return { title: cleaned, scheduledFor, dueAt };
}
