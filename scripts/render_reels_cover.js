const { chromium } = require("playwright");
const path = require("path");
const fs = require("fs");
const https = require("https");

function uploadFile(filePath, fileName) {
  return new Promise((resolve, reject) => {
    const fileData = fs.readFileSync(filePath);
    const boundary = "----WebKitFormBoundaryCover" + Date.now();
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

async function renderCover() {
  console.log("Launching Edge to render Reels Cover...");
  const browser = await chromium.launch({ channel: "msedge", headless: true });
  const context = await browser.newContext({
    viewport: { width: 1080, height: 1920 },
    deviceScaleFactor: 2 // 2160 x 3840 Ultra HD
  });
  const page = await context.newPage();

  const fileUrl = "file://" + path.join(__dirname, "../public/reels_cover_template.html").replace(/\\/g, "/");
  await page.goto(fileUrl, { waitUntil: "networkidle" });
  await page.waitForTimeout(1000);

  const coverPath = path.join(__dirname, "../../randevuformu_reels_kapak.png");
  await page.screenshot({ path: coverPath });
  console.log("Reels cover saved to:", coverPath);

  await browser.close();

  console.log("Uploading Reels cover for mobile download...");
  const coverUrl = await uploadFile(coverPath, "randevuformu_reels_kapak.png");
  console.log("COVER_URL:", coverUrl);
  console.log("ALL_DONE");
}

renderCover().catch(console.error);
