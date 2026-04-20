#!/usr/bin/env node
import https from 'https';
import { writeFileSync, readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT = join(__dirname, '../src/data/registrations.json');

const CATEGORIES = [
  {
    id: 'catamaran_duo',
    name: 'Catamaran duo handed',
    nameNl: 'Catamaran duo',
    url: 'https://scoring.winterwave.nl/register/5bb713f702ce',
  },
  {
    id: 'wingfoil',
    name: 'Wingfoil Marathon',
    nameNl: 'Wingfoil',
    url: 'https://scoring.winterwave.nl/register/3b15cb900f46',
  },
  {
    id: 'windsurf',
    name: 'Windsurfing Marathon',
    nameNl: 'Windsurf',
    url: 'https://scoring.winterwave.nl/register/b2fc55e1570b',
  },
  {
    id: 'catamaran_single',
    name: 'Catamaran single handed',
    nameNl: 'Catamaran solo',
    url: 'https://scoring.winterwave.nl/register/8a25c2112cf6',
  },
];

// Map winterwave class names → boats.json IDs
const CLASS_MAP = {
  // F18 generic
  'f18': 'formula_18',
  'formula 18': 'formula_18',
  'formule 18': 'formula_18',
  'catamaran f18': 'formula_18',
  'f18 c2': 'formula_18',
  // Nacra F18 Infusion
  'nacra infusion f18': 'nacra_infusion_f18',
  'nacra f18 infusion': 'nacra_infusion_f18',
  'nacra f18 infusion mk3': 'nacra_infusion_f18',
  'nacra f18 infusion (2008)': 'nacra_infusion_f18',
  'nacra f 18 infusion': 'nacra_infusion_f18',
  'nacra infusion mk2': 'nacra_infusion_f18',
  'nacra f18 infusion mark 1': 'nacra_infusion_f18',
  'f18 nacra infusion': 'nacra_infusion_f18',
  'f18 nacra infusion mk3': 'nacra_infusion_f18',
  'f18 nacra infusion mark 1': 'nacra_infusion_f18',
  // Nacra F18 other
  'nacra f18': 'nacra_f18',
  'nacra f18 evolution': 'nacra_f18',
  'f18 nacra': 'nacra_f18',
  // Capricorn F18
  'f18 capricorn': 'ahpc_capricorn_f18',
  'f18/capricorn': 'ahpc_capricorn_f18',
  // Goodall F18
  'f18 goodall akurra': 'formula_18',
  'f18 - goodall akurra': 'formula_18',
  // Hobie Tiger F18
  'hobie tiger f18': 'hobie_tiger_f18',
  'hobie tiger': 'hobie_tiger_f18',
  'hobie cat tiger f18': 'hobie_tiger_f18',
  'hobie f18': 'hobie_tiger_f18',
  'f18/hobie tiger': 'hobie_tiger_f18',
  'f18 hobie cat': 'hobie_tiger_f18',
  // Hobie Wildcat
  'hobie wildcat': 'hobie_wildcat_f18',
  'wildcat / formule 18': 'hobie_wildcat_f18',
  // Hobie 16
  'hobie 16': 'hobie_16',
  'hobie16': 'hobie_16',
  'hobie cat 16': 'hobie_16',
  // Hobie 18
  'hobie 18': 'hobie_18',
  // Nacra 15-17
  'nacra 15': 'nacra_15',
  'nacra 16': 'nacra_16vm',
  'nacra 17': 'nacra_17_olympic_class_full_foiler',
  'nacra 17 mk1': 'nacra_17_mk1',
  // Nacra 20
  'nacra 20': 'nacra_20_one_design',
  'nacra 20fcs': 'nacra_f20_carbon_fcs',
  'nacra inter 20': 'nacra_inter_20_f20',
  // Nacra 500 series
  'nacra 500': 'nacra_500_mk2',
  'nacra 500 mkii': 'nacra_500_mk2',
  'nacra 500 mk2': 'nacra_500_mk2',
  'nacra 500 sport': 'nacra_500_sport',
  'nacra mk2': 'nacra_500_mk2',
  // Nacra 570
  'nacra 570': 'nacra_570_mkii',
  'nacra 570 mk 2': 'nacra_570_mkii',
  'nacra 570 sport': 'nacra_570_sport',
  // Nacra 580
  'nacra 580': 'nacra_580_provisional_sport',
  // Nacra 5.x
  'nacra 5.5': 'nacra_5_5_sl',
  'nacra 5.7': 'nacra_5_7_race',
  'nacra 5.8': 'nacra_5_8',
  'nacra 6.0': 'nacra_6_0',
  // Nacra F16
  'nacra f16': 'nacra_f16_double',
  'f16': 'nacra_f16_double',
  'f16 - viper': 'nacra_f16_double',
  'f16 falcon': 'falcon_f16_double',
  // Nacra F17
  'nacra f17': 'nacra_f17_sloop',
  'nacra f17 sloop': 'nacra_f17_sloop',
  // Nacra F20
  'nacra f 20 carbon': 'nacra_f20_carbon',
  'nacra f20 carbon': 'nacra_f20_carbon',
  'nacra f20 fcs': 'nacra_f20_carbon_fcs',
  'nacra f20 carbon fcs': 'nacra_f20_carbon_fcs',
  // Nacra Inter 17
  'nacra inter 17': 'nacra_inter_17r',
  'inter 17': 'nacra_inter_17r',
  // Eagle / F20
  'f20': 'formula_20',
  'eagle f20': 'eagle_f20',
  // Dart
  'dart 18': 'dart_18',
  'dart18': 'dart_18',
  'dart (catamaran)': 'dart_18',
  'dart 20': 'dart_20',
  'dart hawk': 'dart_hawk_f18',
  // Topcat
  'topcat k2': 'topcat_k2x_classic',
  'topcat/k2x': 'topcat_k2x_classic',
  'k2': 'topcat_k2x_classic',
  'topcat k1': 'topcat_k1_classic',
  'topcat k1 classic': 'topcat_k1_classic',
  'topkat k1 classic': 'topcat_k1_classic',
  'topcat k3x touring': 'topcat_k3x_avtive_touring_jib',
  // Other
  'tornado': 'tornado',
  'prindle 16': 'prindle_16',
  'bim javelin 18 high tech': 'bim_javelin_18_hightech',
  'zeekat': 'zeekat',
};

function fetchPage(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

function stripTags(html) {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function parseNames(raw) {
  const clean = raw.replace(/\([^)]+\)/g, '').replace(/\s+/g, ' ').trim();
  const parts = clean.split(',').map(s => s.trim()).filter(Boolean);
  return { skipper: parts[0] || '', crew: parts[1] || null };
}

function parseRegistrations(html) {
  const tbodyMatch = html.match(/<tbody>([\s\S]*?)<\/tbody>/);
  if (!tbodyMatch) return [];

  const boats = [];
  const rows = [...tbodyMatch[1].matchAll(/<tr>([\s\S]*?)<\/tr>/g)];

  for (const rowMatch of rows) {
    const row = rowMatch[1];
    const thMatch = row.match(/<th[^>]*>([\s\S]*?)<\/th>/);
    const tds = [...row.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/g)];
    if (tds.length < 2) continue;

    const index = thMatch ? stripTags(thMatch[1]) : '';
    const nameStr = stripTags(tds[0][1]);
    const { skipper, crew } = parseNames(nameStr);

    // Full catamaran table: sailNumber, country, boatClass, vak, spinnaker, rating, status
    if (tds.length >= 7) {
      const sailNumber = stripTags(tds[1][1]);
      const country = stripTags(tds[2][1]);
      const boatClass = stripTags(tds[3][1]);
      const spinnaker = stripTags(tds[5][1]).toLowerCase() === 'yes';
      const rating = parseInt(stripTags(tds[6][1])) || 0;
      const boatId = CLASS_MAP[boatClass.toLowerCase()] ?? null;

      boats.push({
        id: `reg_${String(index).padStart(3, '0')}`,
        skipper,
        crew,
        sailNumber,
        boatName: sailNumber,
        boatClass,
        country,
        boatId,
        spinnaker,
        rating,
      });
    } else {
      // Simplified table (wingfoil/windsurf): name, country, status
      const country = tds.length >= 2 ? stripTags(tds[1][1]) : '';
      boats.push({
        id: `reg_${String(index).padStart(3, '0')}`,
        skipper,
        crew: null,
        sailNumber: '',
        boatName: '',
        boatClass: '',
        country,
        boatId: null,
      });
    }
  }
  return boats;
}

async function main() {
  const categories = {};
  let allBoats = [];

  for (const cat of CATEGORIES) {
    console.log(`Fetching ${cat.id}...`);
    const html = await fetchPage(cat.url);
    const boats = parseRegistrations(html);
    console.log(` → ${boats.length} registrations`);

    categories[cat.id] = {
      name: cat.name,
      nameNl: cat.nameNl,
      count: boats.length,
      url: cat.url,
    };

    // Only store boat details for catamaran categories (used in comparator)
    if (cat.id.startsWith('catamaran')) {
      allBoats = allBoats.concat(boats.map(b => ({ ...b, category: cat.id })));
    }
  }

  const output = {
    fetchedAt: new Date().toISOString(),
    categories,
    boats: allBoats,
  };

  writeFileSync(OUTPUT, JSON.stringify(output, null, 2));
  console.log(`\nSaved to ${OUTPUT}`);
  console.log('Counts:', Object.entries(categories).map(([k, v]) => `${k}: ${v.count}`).join(', '));
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
