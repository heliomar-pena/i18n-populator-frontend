import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Paths
const countriesPath = path.resolve(__dirname, "../src/data/countries.json");
const outDir = path.resolve(__dirname, "../public/assets/countries");

// FlagCDN size (closest to 110x110 while keeping aspect ratio)
const WIDTH = 160;
const HEIGHT = 120; // 110 * 3/4

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

async function loadCountries() {
  const raw = await fs.readFile(countriesPath, "utf-8");
  return JSON.parse(raw);
}

async function downloadFlag(code) {
  const url = `https://flagcdn.com/${WIDTH}x${HEIGHT}/${code.toLowerCase()}.png`;
  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(`Failed ${code}: ${res.status}`);
  }

  const buffer = Buffer.from(await res.arrayBuffer());
  const filePath = path.join(outDir, `${code.toLowerCase()}.png`);
  await fs.writeFile(filePath, buffer);
}

async function main() {
  await ensureDir(outDir);
  const countries = await loadCountries();

  console.log(`Downloading ${countries.length} flags (${WIDTH}x${HEIGHT})...`);

  let ok = 0;
  for (const c of countries) {
    try {
      await downloadFlag(c.code);
      ok++;
      process.stdout.write(`✓ ${c.code}  `);
    } catch (err) {
      console.error(`\n✗ ${c.code}: ${err.message}`);
    }
  }

  console.log(`\nDone. Downloaded ${ok}/${countries.length} flags.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
