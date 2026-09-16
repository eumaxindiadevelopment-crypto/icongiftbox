/**
 * Generates real AI product images using Pollinations.ai (free, no API key needed)
 * Downloads each image and updates the product in MySQL
 */
require('dotenv').config();
const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const { sequelize, Product, ProductImage, Category } = require('./src/models');

const uploadDir = path.join(__dirname, 'uploads/products');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// Download image from URL, following redirects, save to disk
function downloadImage(url, filepath, redirects = 0) {
  return new Promise((resolve, reject) => {
    if (redirects > 5) return reject(new Error('Too many redirects'));
    const protocol = url.startsWith('https') ? https : http;
    const req = protocol.get(url, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302 || res.statusCode === 307) {
        res.resume(); // drain
        return downloadImage(res.headers.location, filepath, redirects + 1)
          .then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        res.resume();
        return reject(new Error(`HTTP ${res.statusCode}`));
      }
      const file = fs.createWriteStream(filepath);
      res.pipe(file);
      file.on('finish', () => file.close(() => resolve()));
      file.on('error', (err) => { try { fs.unlinkSync(filepath); } catch {} reject(err); });
    });
    req.on('error', reject);
    req.setTimeout(45000, () => { req.destroy(); reject(new Error('Timeout')); });
  });
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// Build a focused product photography prompt
function buildPrompt(productName, categoryName) {
  const base = `professional studio product photography of ${productName}, corporate gift item`;
  const style = 'clean white background, soft lighting, high resolution, commercial product photo, 4K, no text';
  const category = categoryName ? `, ${categoryName} category` : '';
  return encodeURIComponent(`${base}${category}, ${style}`);
}

async function run() {
  await sequelize.authenticate();

  // Optional: node ai-generate-images.js <id1> <id2> ... to regenerate only specific
  // products (e.g. after adding new ones) instead of the whole catalog.
  const idFilter = process.argv.slice(2).map(Number).filter(Boolean)
  const products = await Product.findAll({
    where: idFilter.length ? { id: idFilter } : undefined,
    include: [
      { model: Category, as: 'categories', attributes: ['id', 'name'], through: { attributes: [] } },
      { association: 'images' },
    ],
  });

  console.log(`\nGenerating AI images for ${products.length} products via Pollinations.ai...\n`);
  console.log('(Free service — ~3s per image, no API key required)\n');

  let success = 0, failed = 0;

  for (let i = 0; i < products.length; i++) {
    const prod = products[i];
    const catName = prod.categories?.[0]?.name || 'Corporate Gift';
    const prompt = buildPrompt(prod.name, catName);
    const seed = i + 100; // fixed seed per product for reproducibility

    const imageUrl = `https://image.pollinations.ai/prompt/${prompt}?width=512&height=512&seed=${seed}&model=flux&nologo=true&enhance=true`;
    const filename = `ai-${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`;
    const filepath = path.join(uploadDir, filename);

    process.stdout.write(`  [${i + 1}/${products.length}] ${prod.name}... `);

    let attempts = 0;
    let downloaded = false;

    while (attempts < 3 && !downloaded) {
      try {
        await downloadImage(imageUrl, filepath);
        downloaded = true;
      } catch (err) {
        attempts++;
        if (attempts < 3) {
          process.stdout.write(`retry ${attempts}... `);
          await sleep(3000);
        } else {
          console.log(`FAILED (${err.message})`);
          failed++;
        }
      }
    }

    if (downloaded) {
      // Delete old image file if it was a generated placeholder
      if (prod.images?.[0]?.src) {
        const oldFile = path.basename(prod.images[0].src);
        const oldPath = path.join(uploadDir, oldFile);
        if (fs.existsSync(oldPath) && oldFile !== filename) {
          try { fs.unlinkSync(oldPath); } catch {}
        }
      }

      const newUrl = `http://localhost:5000/uploads/products/${filename}`;
      await ProductImage.destroy({ where: { productId: prod.id } });
      await ProductImage.create({ productId: prod.id, src: newUrl, alt: prod.name, sortOrder: 0 });

      console.log(`OK`);
      success++;
    }

    // Rate limit: wait 2.5s between requests to be polite
    if (i < products.length - 1) await sleep(2500);
  }

  console.log(`\n✔ Done! ${success} images generated, ${failed} failed.`);
  console.log(`Images saved to: ${uploadDir}`);
  process.exit();
}

run().catch(e => { console.error('\nError:', e.message); process.exit(1); });
