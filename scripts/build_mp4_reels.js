const { chromium } = require("playwright");
const path = require("path");
const fs = require("fs");
const { execSync } = require("child_process");
const https = require("https");

const FFMPEG_PATH = "C:\\Users\\yeren\\AppData\\Local\\Microsoft\\WinGet\\Packages\\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\\ffmpeg-9.0.1-full_build\\bin\\ffmpeg.exe";

function uploadFile(filePath, fileName) {
  return new Promise((resolve, reject) => {
    const fileData = fs.readFileSync(filePath);
    const boundary = "----WebKitFormBoundaryMP4Upload" + Date.now();
    const head = Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="${fileName}"\r\nContent-Type: video/mp4\r\n\r\n`);
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

async function generate60FpsVideo() {
  const framesDir = path.join(__dirname, "../temp_frames");
  if (fs.existsSync(framesDir)) {
    fs.rmSync(framesDir, { recursive: true, force: true });
  }
  fs.mkdirSync(framesDir, { recursive: true });

  console.log("Launching Edge to capture lossless 60 FPS frames (1080x1920)...");
  const browser = await chromium.launch({ channel: "msedge", headless: true });
  const context = await browser.newContext({
    viewport: { width: 1080, height: 1920 },
    deviceScaleFactor: 1
  });
  const page = await context.newPage();

  const fileUrl = "file://" + path.join(__dirname, "../public/reels_frame_renderer.html").replace(/\\/g, "/");
  await page.goto(fileUrl, { waitUntil: "networkidle" });

  // 10 seconds at 30 FPS = 300 lossless frames
  // (30 FPS constant gives 100% fluid mobile performance with low battery/decoder strain)
  const fps = 30;
  const durationSec = 10;
  const totalFrames = fps * durationSec;

  console.log(`Rendering ${totalFrames} pristine frames at ${fps} FPS...`);
  for (let i = 0; i < totalFrames; i++) {
    const progress = i / (totalFrames - 1);
    await page.evaluate((p) => window.renderFrameAt(p), progress);
    const frameNum = String(i).padStart(5, '0');
    await page.screenshot({
      path: path.join(framesDir, `frame_${frameNum}.png`),
      type: "png"
    });
    if (i % 50 === 0 || i === totalFrames - 1) {
      console.log(`Rendered frame ${i + 1}/${totalFrames} (${Math.round((i + 1) / totalFrames * 100)}%)`);
    }
  }

  await browser.close();
  console.log("All frames captured. Encoding with FFmpeg into high-profile MP4 (H.264)...");

  const outputMp4 = path.join(__dirname, "../../randevuformu_reels_pro.mp4");
  if (fs.existsSync(outputMp4)) {
    fs.unlinkSync(outputMp4);
  }

  // FFmpeg command for iOS & Android native compatibility:
  // -pix_fmt yuv420p (Crucial for mobile playback)
  // -c:v libx264 -profile:v high -level 4.2
  // -crf 17 (Visually lossless studio quality)
  const ffmpegCmd = `"${FFMPEG_PATH}" -y -framerate ${fps} -i "${framesDir}\\frame_%05d.png" -c:v libx264 -profile:v high -level 4.2 -pix_fmt yuv420p -crf 17 -movflags +faststart "${outputMp4}"`;
  
  console.log("Running FFmpeg encoding...");
  execSync(ffmpegCmd, { stdio: "inherit" });
  console.log("MP4 successfully generated at:", outputMp4);

  // Clean up temp frames to save disk space
  fs.rmSync(framesDir, { recursive: true, force: true });
  console.log("Cleaned up temp frame cache.");

  // Upload to tmpfiles for instant mobile direct download
  console.log("Uploading MP4 for instant mobile download...");
  const mp4Url = await uploadFile(outputMp4, "randevuformu_reels_pro.mp4");
  console.log("FINAL_MP4_URL:", mp4Url);
  console.log("ALL_SUCCESSFUL");
}

generate60FpsVideo().catch(console.error);
