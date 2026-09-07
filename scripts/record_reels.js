const { chromium } = require("playwright");
const path = require("path");
const fs = require("fs");
const https = require("https");

function uploadFile(filePath, fileName) {
  return new Promise((resolve, reject) => {
    const fileData = fs.readFileSync(filePath);
    const boundary = "----WebKitFormBoundaryReelsUpload" + Date.now();
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

async function recordReels() {
  const outputDir = path.join(__dirname, "../videos");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  console.log("Launching Edge to record Reels video...");
  const browser = await chromium.launch({ channel: "msedge", headless: true });
  const context = await browser.newContext({
    viewport: { width: 1080, height: 1920 },
    recordVideo: {
      dir: outputDir,
      size: { width: 1080, height: 1920 }
    }
  });

  const page = await context.newPage();
  const fileUrl = "file://" + path.join(__dirname, "../public/reels_template.html").replace(/\\/g, "/");

  console.log("Loading reels template:", fileUrl);
  await page.goto(fileUrl, { waitUntil: "networkidle" });

  // Record for 13.5 seconds
  console.log("Recording video scenes (13.5s)...");
  await page.waitForTimeout(13500);

  console.log("Closing context to finalize video encoding...");
  await page.close();
  await context.close();
  await browser.close();

  // Find generated video in outputDir
  const videoFiles = fs.readdirSync(outputDir).filter(f => f.endsWith(".webm"));
  if (videoFiles.length === 0) {
    throw new Error("No video file was created in " + outputDir);
  }

  // Pick the most recent video
  const latestVideo = videoFiles.map(f => ({
    name: f,
    time: fs.statSync(path.join(outputDir, f)).mtime.getTime()
  })).sort((a, b) => b.time - a.time)[0].name;

  const originalVideoPath = path.join(outputDir, latestVideo);
  const targetVideoPath = path.join(__dirname, "../../randevuformu_reels_video.webm");
  fs.copyFileSync(originalVideoPath, targetVideoPath);
  console.log("Final Reels video saved at:", targetVideoPath);

  // Upload video
  console.log("Uploading Reels video to tmpfiles.org for mobile download...");
  const videoUrl = await uploadFile(targetVideoPath, "randevuformu_reels_video.webm");
  console.log("REELS_VIDEO_URL:", videoUrl);
  console.log("ALL_DONE");
}

recordReels().catch(console.error);
