const { chromium } = require("playwright");
const path = require("path");
const fs = require("fs");
const https = require("https");

function uploadFile(filePath, fileName) {
  return new Promise((resolve, reject) => {
    const fileData = fs.readFileSync(filePath);
    const boundary = "----WebKitFormBoundary4KUpload" + Date.now();
    const head = Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="${fileName}"\r\nContent-Type: video/webm\r\n\r\n`);
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

async function record4K() {
  const outputDir = path.join(__dirname, "../videos");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  console.log("Launching Edge with GPU acceleration for 4K Smooth Video Recording...");
  const browser = await chromium.launch({
    channel: "msedge",
    headless: true,
    args: [
      "--enable-gpu",
      "--use-gl=angle",
      "--enable-webgl",
      "--ignore-gpu-blocklist",
      "--disable-gpu-vsync",
      "--enable-features=VaapiVideoDecoder"
    ]
  });

  // 4K Vertical resolution: 2160 x 3840
  const context = await browser.newContext({
    viewport: { width: 2160, height: 3840 },
    recordVideo: {
      dir: outputDir,
      size: { width: 2160, height: 3840 }
    }
  });

  const page = await context.newPage();
  const fileUrl = "file://" + path.join(__dirname, "../public/reels_4k_light.html").replace(/\\/g, "/");

  console.log("Loading 4K light template:", fileUrl);
  await page.goto(fileUrl, { waitUntil: "networkidle" });

  // Record 12.5 seconds (full cycle)
  console.log("Recording 4K Ultra Smooth Video (12.5s)...");
  await page.waitForTimeout(12500);

  console.log("Closing context to encode 4K video stream...");
  await page.close();
  await context.close();
  await browser.close();

  // Pick the latest video
  const videoFiles = fs.readdirSync(outputDir).filter(f => f.endsWith(".webm"));
  const latestVideo = videoFiles.map(f => ({
    name: f,
    time: fs.statSync(path.join(outputDir, f)).mtime.getTime()
  })).sort((a, b) => b.time - a.time)[0].name;

  const srcPath = path.join(outputDir, latestVideo);
  const targetPath = path.join(__dirname, "../../randevuformu_reels_4k_light.webm");
  fs.copyFileSync(srcPath, targetPath);
  console.log("Saved 4K video to:", targetPath);

  console.log("Uploading 4K video for instant mobile download...");
  const videoUrl = await uploadFile(targetPath, "randevuformu_reels_4k_light.webm");
  console.log("4K_REELS_URL:", videoUrl);
  console.log("RECORD_COMPLETE");
}

record4K().catch(console.error);
