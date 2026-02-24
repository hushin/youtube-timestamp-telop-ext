import puppeteer from 'puppeteer';
import sharp from 'sharp';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { stat } from 'fs/promises';

const __dirname = dirname(fileURLToPath(import.meta.url));

const configs = [
  {
    name: 'icon',
    html: 'icon.html',
    output: 'icon.png',
    viewportWidth: 256,
    viewportHeight: 256,
    outputWidth: 128,
    outputHeight: 128,
    deviceScaleFactor: 2,
    transparent: true,
  },
  {
    name: 'promo_small',
    html: 'promo.html',
    output: 'promo_small.png',
    viewportWidth: 880,
    viewportHeight: 560,
    outputWidth: 440,
    outputHeight: 280,
    deviceScaleFactor: 2,
    transparent: false,
  },
  {
    name: 'screenshot_1',
    html: 'screenshot.html',
    output: 'screenshot_1.png',
    viewportWidth: 1280,
    viewportHeight: 800,
    outputWidth: 1280,
    outputHeight: 800,
    deviceScaleFactor: 2,
    transparent: false,
  },
];

async function main() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  for (const cfg of configs) {
    console.log(`\n--- Capturing ${cfg.name} ---`);

    const page = await browser.newPage();
    await page.setViewport({
      width: cfg.viewportWidth,
      height: cfg.viewportHeight,
      deviceScaleFactor: cfg.deviceScaleFactor,
    });

    const htmlPath = resolve(__dirname, cfg.html);
    await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle0' });

    // Wait for fonts to load
    await page.waitForFunction(() => document.fonts.ready);
    await new Promise((r) => setTimeout(r, 2000));

    const buffer = await page.screenshot({
      omitBackground: cfg.transparent,
      type: 'png',
    });

    const outputPath = resolve(__dirname, cfg.output);
    await sharp(buffer)
      .resize(cfg.outputWidth, cfg.outputHeight, { fit: 'fill' })
      .png({ compressionLevel: 9 })
      .toFile(outputPath);

    const info = await sharp(outputPath).metadata();
    const fileInfo = await stat(outputPath);
    console.log(`  Output: ${cfg.output}`);
    console.log(`  Size: ${info.width}x${info.height}`);
    console.log(`  File size: ${(fileInfo.size / 1024).toFixed(1)} KB`);

    await page.close();
  }

  await browser.close();
  console.log('\nDone!');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
