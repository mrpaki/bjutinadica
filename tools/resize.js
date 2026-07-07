// Jednokratni resize skript — zahtijeva: npm install sharp
// Pokreni: node tools/resize.js
// Originali se čuvaju u foto/original/, web verzije ostaju u foto/

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const FOTO_DIR = path.join(__dirname, '..', 'foto');
const ORIG_DIR = path.join(FOTO_DIR, 'original');

const HERO_MAX = 1600;
const GAL_MAX = 900;
const QUALITY = 80;

const HERO_PATTERN = /^hero-/;

if (!fs.existsSync(ORIG_DIR)) fs.mkdirSync(ORIG_DIR);

const files = fs.readdirSync(FOTO_DIR).filter(f =>
  /\.(jpe?g|webp|png)$/i.test(f)
);

(async () => {
  for (const file of files) {
    const src = path.join(FOTO_DIR, file);
    const orig = path.join(ORIG_DIR, file);
    const maxW = HERO_PATTERN.test(file) ? HERO_MAX : GAL_MAX;

    fs.copyFileSync(src, orig);

    const meta = await sharp(src).metadata();
    if (meta.width <= maxW) {
      console.log(`skip  ${file} (${meta.width}px <= ${maxW}px)`);
      continue;
    }

    await sharp(src)
      .resize({ width: maxW, withoutEnlargement: true })
      .jpeg({ quality: QUALITY, mozjpeg: true })
      .toFile(src + '.tmp');

    fs.renameSync(src + '.tmp', src);
    const after = fs.statSync(src).size;
    console.log(`ok    ${file} → ${maxW}px max, ${(after/1024).toFixed(0)} KB`);
  }
  console.log('\nGotovo. Originali su u foto/original/');
})();
