const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

async function generateBrandAssets() {
  const logoPath = path.join(__dirname, '..', 'public', 'logo.png');
  const srcAppDir = path.join(__dirname, '..', 'src', 'app');
  const publicDir = path.join(__dirname, '..', 'public');

  console.log('Reading brand logo from:', logoPath);
  const logoBuffer = fs.readFileSync(logoPath);

  // 1. Generate 512x512 icon.png with centered crisp logo
  const icon512 = await sharp({
    create: {
      width: 512,
      height: 512,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    }
  })
  .composite([
    {
      input: await sharp(logoBuffer)
        .resize(440, 440, { fit: 'inside' })
        .toBuffer(),
      gravity: 'center'
    }
  ])
  .png({ quality: 100, compressionLevel: 9 })
  .toBuffer();

  fs.writeFileSync(path.join(srcAppDir, 'icon.png'), icon512);
  fs.writeFileSync(path.join(publicDir, 'icon.png'), icon512);
  console.log('✓ Generated icon.png (512x512)');

  // 2. Generate 180x180 apple-icon.png (on brand dark blue #0F2A4A background for iOS)
  const appleIcon = await sharp({
    create: {
      width: 180,
      height: 180,
      channels: 4,
      background: { r: 15, g: 42, b: 74, alpha: 1 } // #0F2A4A
    }
  })
  .composite([
    {
      input: await sharp(logoBuffer)
        .resize(140, 140, { fit: 'inside' })
        .toBuffer(),
      gravity: 'center'
    }
  ])
  .png({ quality: 100 })
  .toBuffer();

  fs.writeFileSync(path.join(srcAppDir, 'apple-icon.png'), appleIcon);
  fs.writeFileSync(path.join(publicDir, 'apple-icon.png'), appleIcon);
  console.log('✓ Generated apple-icon.png (180x180)');

  // 3. Generate 48x48 PNG for ICO
  const icon48Png = await sharp(logoBuffer)
    .resize(48, 48, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

  // Construct valid Windows ICO containing 48x48 PNG
  const icoHeader = Buffer.alloc(22);
  icoHeader.writeUInt16LE(0, 0); // Reserved
  icoHeader.writeUInt16LE(1, 2); // Type: 1 = ICO
  icoHeader.writeUInt16LE(1, 4); // Count of images: 1

  // Directory entry
  icoHeader.writeUInt8(48, 6); // Width
  icoHeader.writeUInt8(48, 7); // Height
  icoHeader.writeUInt8(0, 8);  // Color count (0 = >=8bpp)
  icoHeader.writeUInt8(0, 9);  // Reserved
  icoHeader.writeUInt16LE(1, 10); // Color planes
  icoHeader.writeUInt16LE(32, 12); // Bits per pixel
  icoHeader.writeUInt32LE(icon48Png.length, 14); // Size of image data
  icoHeader.writeUInt32LE(22, 18); // Offset of image data

  const icoBuffer = Buffer.concat([icoHeader, icon48Png]);
  fs.writeFileSync(path.join(srcAppDir, 'favicon.ico'), icoBuffer);
  fs.writeFileSync(path.join(publicDir, 'favicon.ico'), icoBuffer);
  console.log('✓ Generated favicon.ico (48x48 PNG in ICO container)');

  // 4. Generate OpenGraph Image (1200x630)
  // Let's create a sleek brand card with the logo, gradient accent, and title
  const ogSvg = `
  <svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#0F2A4A" />
        <stop offset="60%" stop-color="#091E36" />
        <stop offset="100%" stop-color="#040D1A" />
      </linearGradient>
      <linearGradient id="glow" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#0062FF" stop-opacity="0.4" />
        <stop offset="100%" stop-color="#0062FF" stop-opacity="0" />
      </linearGradient>
    </defs>
    <rect width="1200" height="630" fill="url(#bg)" />
    <circle cx="1050" cy="150" r="350" fill="url(#glow)" />
    <circle cx="150" cy="550" r="250" fill="url(#glow)" />
    
    <!-- Decorative border -->
    <rect x="30" y="30" width="1140" height="570" rx="24" fill="none" stroke="#0062FF" stroke-width="1.5" stroke-opacity="0.25" />
    
    <!-- Tagline & Badge -->
    <rect x="80" y="80" width="220" height="40" rx="20" fill="#0062FF" fill-opacity="0.2" stroke="#0062FF" stroke-opacity="0.5" />
    <text x="190" y="105" fill="#60A5FA" font-family="system-ui, -apple-system, sans-serif" font-size="14" font-weight="700" letter-spacing="1" text-anchor="middle">ONLINE RANDEVU SİSTEMİ</text>
    
    <!-- Main Headline -->
    <text x="80" y="240" fill="#FFFFFF" font-family="system-ui, -apple-system, sans-serif" font-size="52" font-weight="800" letter-spacing="-1">
      randevuformu.com
    </text>
    <text x="80" y="310" fill="#E2E8F0" font-family="system-ui, -apple-system, sans-serif" font-size="28" font-weight="500">
      Türkiye'nin Lider Online Randevu ve Rezervasyon Altyapısı
    </text>
    <text x="80" y="365" fill="#94A3B8" font-family="system-ui, -apple-system, sans-serif" font-size="20" font-weight="400">
      WhatsApp Onaylı • Google Takvim Senkronize • 30 Saniyede Kurulum
    </text>

    <!-- Bottom Features Pill -->
    <g transform="translate(80, 480)">
      <rect x="0" y="0" width="200" height="46" rx="12" fill="#1E3A5F" fill-opacity="0.6" stroke="#38BDF8" stroke-opacity="0.3" />
      <text x="100" y="29" fill="#F8FAFC" font-family="system-ui, -apple-system, sans-serif" font-size="15" font-weight="600" text-anchor="middle">✓ Atomik Çakışma Kilidi</text>

      <rect x="220" y="0" width="200" height="46" rx="12" fill="#1E3A5F" fill-opacity="0.6" stroke="#38BDF8" stroke-opacity="0.3" />
      <text x="320" y="29" fill="#F8FAFC" font-family="system-ui, -apple-system, sans-serif" font-size="15" font-weight="600" text-anchor="middle">✓ WhatsApp Hatırlatma</text>

      <rect x="440" y="0" width="220" height="46" rx="12" fill="#1E3A5F" fill-opacity="0.6" stroke="#38BDF8" stroke-opacity="0.3" />
      <text x="550" y="29" fill="#F8FAFC" font-family="system-ui, -apple-system, sans-serif" font-size="15" font-weight="600" text-anchor="middle">✓ Özel İşletme Subdomaini</text>
    </g>
  </svg>
  `;

  // Composite the logo on the right side of the OG image
  const logoResized = await sharp(logoBuffer)
    .resize(300, 300, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toBuffer();

  const ogCard = await sharp(Buffer.from(ogSvg))
    .composite([
      {
        input: logoResized,
        left: 820,
        top: 150
      }
    ])
    .png({ quality: 95 })
    .toBuffer();

  fs.writeFileSync(path.join(srcAppDir, 'opengraph-image.png'), ogCard);
  fs.writeFileSync(path.join(publicDir, 'og-image.png'), ogCard);
  fs.writeFileSync(path.join(publicDir, 'og-image.jpg'), await sharp(ogCard).jpeg({ quality: 90 }).toBuffer());
  console.log('✓ Generated opengraph-image.png and og-image.png (1200x630)');
}

generateBrandAssets().catch(err => {
  console.error('Error generating brand assets:', err);
  process.exit(1);
});
