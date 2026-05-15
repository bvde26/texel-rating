#!/usr/bin/env node
// Scrapet het wedstrijdprogramma van roundtexel.com en schrijft het naar
// src/data/schedule.json. Defensief: bij een onverwachte paginastructuur
// wordt NIET overschreven (oude data blijft staan).
import https from 'https';
import crypto from 'crypto';
import { writeFileSync, readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT = join(__dirname, '../src/data/schedule.json');
const SOURCE = 'https://www.roundtexel.com/en/competition-info';

function fetchPage(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (texel-rating bot)' } }, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

const stripTags = (html) =>
  html
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#39;|&rsquo;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&[a-z]+;/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/\s+([.,;:!?])/g, '$1')
    .trim();

// Splitst een <p> in titel / beschrijving / tijd / locatie.
function parseEvent(pHtml) {
  const strongMatch = pHtml.match(/<strong>([\s\S]*?)<\/strong>/i);
  let title = strongMatch ? stripTags(strongMatch[1]) : '';
  title = title.replace(/^\s*\d+\.\s*/, '').trim();

  // Alle <em>-blokken: bevatten tijd / start- en finishinfo
  const ems = [...pHtml.matchAll(/<em>([\s\S]*?)<\/em>/gi)].map((m) => stripTags(m[1]));
  let time = '';
  let location = '';
  for (const e of ems) {
    if (/^tijd:/i.test(e)) time = e.replace(/^tijd:\s*/i, '').replace(/\s*\.\s*$/, '').trim();
    else if (/start-?\s*en\s*finish/i.test(e)) location = e.trim();
  }

  // Beschrijving = volledige p-tekst minus titel/tijd/locatie
  let rest = pHtml;
  if (strongMatch) rest = rest.replace(strongMatch[0], ' ');
  rest = rest.replace(/<em>[\s\S]*?<\/em>/gi, ' ');
  let desc = stripTags(rest).replace(/^\s*\d+\.\s*/, '').trim();
  if (!title && desc) {
    title = desc;
    desc = '';
  }
  const ev = { title };
  if (desc) ev.desc = desc;
  if (time) ev.time = time;
  if (location) ev.location = location;
  return ev;
}

function parseProgram(html) {
  if (!/Programma/i.test(html)) throw new Error('Programma-sectie niet gevonden');

  const items = [...html.matchAll(
    /<div[^>]*class="el-item[^"]*"[\s\S]*?<h2[^>]*class="uk-h4[^"]*"[^>]*>([\s\S]*?)<\/h2>[\s\S]*?<div class="el-content[^"]*">([\s\S]*?)<\/div>\s*<\/div>/gi
  )];

  if (items.length === 0) throw new Error('Geen programma-dagen gevonden');

  const MONTHS = { januari: 1, februari: 2, maart: 3, april: 4, mei: 5, juni: 6, juli: 7, augustus: 8, september: 9, oktober: 10, november: 11, december: 12 };
  const yearMatch = html.match(/Titels\s*(20\d{2})/i);
  const year = yearMatch ? parseInt(yearMatch[1]) : new Date().getFullYear();

  const days = [];
  for (const it of items) {
    const dayTitle = stripTags(it[1]);
    const content = it[2];
    const dm = dayTitle.match(/(\d{1,2})\s+([a-z]+)/i);
    let date = '';
    if (dm && MONTHS[dm[2].toLowerCase()]) {
      const mm = String(MONTHS[dm[2].toLowerCase()]).padStart(2, '0');
      const dd = String(parseInt(dm[1])).padStart(2, '0');
      date = `${year}-${mm}-${dd}`;
    }
    const events = [...content.matchAll(/<p>([\s\S]*?)<\/p>/gi)]
      .map((m) => parseEvent(m[1]))
      .filter((e) => e.title);
    days.push({ date, title: dayTitle, events });
  }

  const edMatch = html.match(/(\d+)e?\s*editie van de Ronde om Texel/i);
  const edition = edMatch ? parseInt(edMatch[1]) : null;
  const sat = days.find((d) => /zaterdag/i.test(d.title));

  return {
    eventName: 'Ronde om Texel',
    eventYear: year,
    eventDate: sat ? sat.date : '',
    edition,
    days,
  };
}

async function main() {
  const html = await fetchPage(SOURCE);

  let parsed;
  try {
    parsed = parseProgram(html);
  } catch (err) {
    console.error(`Parsen mislukt (${err.message}) — schedule.json blijft ongewijzigd.`);
    process.exit(0);
  }

  if (!parsed.days.length || !parsed.days.some((d) => d.events.length)) {
    console.error('Geen events geparsed — schedule.json blijft ongewijzigd.');
    process.exit(0);
  }

  // Bestaande rules/contact behouden
  let existing = {};
  try {
    existing = JSON.parse(readFileSync(OUTPUT, 'utf-8'));
  } catch {
    /* eerste run */
  }

  const programHash = crypto
    .createHash('sha256')
    .update(JSON.stringify(parsed.days))
    .digest('hex')
    .slice(0, 16);

  if (existing.programHash === programHash) {
    console.log('Programma ongewijzigd — niets te doen.');
    return;
  }

  const output = {
    ...parsed,
    source: SOURCE,
    fetchedAt: new Date().toISOString(),
    programHash,
    rules: existing.rules ?? [],
    contact: existing.contact ?? {},
  };

  writeFileSync(OUTPUT, JSON.stringify(output, null, 2) + '\n');
  console.log(`Programma bijgewerkt: ${parsed.days.length} dagen, editie ${parsed.edition ?? '?'} (${parsed.eventYear}).`);
  parsed.days.forEach((d) => console.log(` - ${d.title}: ${d.events.length} onderdeel/onderdelen`));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
