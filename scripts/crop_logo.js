const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const page = await browser.newPage();
  const imgBase64 = fs.readFileSync('public/logo.png').toString('base64');
  
  await page.setContent(`
    <!DOCTYPE html>
    <html><body>
      <img id="src" src="data:image/png;base64,${imgBase64}" />
      <canvas id="cvs"></canvas>
      <canvas id="cropped"></canvas>
    </body></html>
  `);

  const result = await page.evaluate(() => {
    const img = document.getElementById('src');
    const cvs = document.getElementById('cvs');
    cvs.width = img.naturalWidth;
    cvs.height = img.naturalHeight;
    const ctx = cvs.getContext('2d');
    ctx.drawImage(img, 0, 0);

    const idata = ctx.getImageData(0, 0, cvs.width, cvs.height);
    const data = idata.data;
    let minX = cvs.width, minY = cvs.height, maxX = 0, maxY = 0;

    for (let y = 0; y < cvs.height; y++) {
      for (let x = 0; x < cvs.width; x++) {
        const idx = (y * cvs.width + x) * 4;
        const r = data[idx];
        const g = data[idx+1];
        const b = data[idx+2];
        const a = data[idx+3];
        // If not pure white and not transparent
        if (a > 20 && (r < 240 || g < 240 || b < 240)) {
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }

    // Add a tiny 4px padding
    const pad = 8;
    const cropX = Math.max(0, minX - pad);
    const cropY = Math.max(0, minY - pad);
    const cropW = Math.min(cvs.width - cropX, (maxX - minX) + pad * 2);
    const cropH = Math.min(cvs.height - cropY, (maxY - minY) + pad * 2);

    const croppedCvs = document.getElementById('cropped');
    croppedCvs.width = cropW;
    croppedCvs.height = cropH;
    const croppedCtx = croppedCvs.getContext('2d');

    // Make white pixels transparent for clean modern blending!
    const croppedImageData = ctx.getImageData(cropX, cropY, cropW, cropH);
    const cData = croppedImageData.data;
    for (let i = 0; i < cData.length; i += 4) {
      const r = cData[i];
      const g = cData[i+1];
      const b = cData[i+2];
      if (r > 240 && g > 240 && b > 240) {
        cData[i+3] = 0; // Transparent
      }
    }
    croppedCtx.putImageData(croppedImageData, 0, 0);

    return {
      minX, minY, maxX, maxY,
      cropW, cropH,
      dataUrl: croppedCvs.toDataURL('image/png')
    };
  });

  console.log('Bounding Box:', result.cropW, 'x', result.cropH);
  
  // Backup original
  if (!fs.existsSync('public/logo_original.png')) {
    fs.copyFileSync('public/logo.png', 'public/logo_original.png');
  }

  // Save tightly cropped logo with transparent background
  const base64Data = result.dataUrl.replace(/^data:image\/png;base64,/, '');
  fs.writeFileSync('public/logo.png', Buffer.from(base64Data, 'base64'));
  console.log('Successfully cropped and saved public/logo.png with transparent background!');

  await browser.close();
})();
