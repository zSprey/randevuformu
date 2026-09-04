const { chromium } = require("playwright");
const path = require("path");
const fs = require("fs");
const https = require("https");

function uploadFile(filePath, fileName) {
  return new Promise((resolve, reject) => {
    const fileData = fs.readFileSync(filePath);
    const boundary = "----WebKitFormBoundaryUpload" + Date.now();
    const head = Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="${fileName}"\r\nContent-Type: image/png\r\n\r\n`);
    const tail = Buffer.from(`\r\n--${boundary}--\r\n`);
    const payload = Buffer.concat([head, fileData, tail]);

    const req = https.request({
      hostname: "tmpfiles.org",
      path: "/api/v1/upload",
      method: "POST",
      headers: {
        "Content-Type": `multipart/form-data; boundary=${boundary}`,
        "Content-Length": payload.length
      }
    }, (res) => {
      let data = "";
      res.on("data", chunk => data += chunk);
      res.on("end", () => {
        try {
          const json = JSON.parse(data);
          const dlUrl = json.data.url.replace("tmpfiles.org/", "tmpfiles.org/dl/");
          resolve(dlUrl);
        } catch (e) {
          reject(new Error("Upload parsing failed: " + data));
        }
      });
    });

    req.on("error", reject);
    req.write(payload);
    req.end();
  });
}

async function main() {
  console.log("Launching Edge to render Instagram Posts...");
  const browser = await chromium.launch({ channel: "msedge", headless: true });
  const context = await browser.newContext({
    viewport: { width: 1400, height: 2600 },
    deviceScaleFactor: 2 // 2x Retina sharpness
  });
  const page = await context.newPage();

  const fileUrl = "file://" + path.join(__dirname, "../public/render_post.html").replace(/\\/g, "/");
  await page.goto(fileUrl, { waitUntil: "networkidle" });
  await page.waitForTimeout(1500);

  // 1. Portrait (1080x1350)
  const portraitEl = page.locator("#canvas-portrait");
  const portraitPath = path.join(__dirname, "../../randevuformu_instagram_post.png");
  await portraitEl.screenshot({ path: portraitPath });
  console.log("Rendered portrait:", portraitPath);

  // 2. Square (1080x1080)
  const squareEl = page.locator("#canvas-square");
  const squarePath = path.join(__dirname, "../../randevuformu_instagram_square.png");
  await squareEl.screenshot({ path: squarePath });
  console.log("Rendered square:", squarePath);

  await browser.close();

  console.log("Uploading rendered images for instant mobile access...");
  const portraitUrl = await uploadFile(portraitPath, "randevuformu_instagram_post.png");
  console.log("PORTRAIT_URL:", portraitUrl);

  const squareUrl = await uploadFile(squarePath, "randevuformu_instagram_square.png");
  console.log("SQUARE_URL:", squareUrl);

  console.log("ALL_DONE_SUCCESSFULLY");
}

main().catch(console.error);
