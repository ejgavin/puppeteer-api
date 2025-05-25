const express = require("express");
const puppeteer = require("puppeteer");

const app = express();

app.get("/", async (req, res) => {
  const targetUrl = req.query.url;
  if (!targetUrl) return res.status(400).json({ error: "Missing ?url param" });

  try {
    const browser = await puppeteer.launch({
      headless: "new",
      // executablePath removed to use default Chromium
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-infobars",
        "--window-position=0,0",
        "--ignore-certifcate-errors",
        "--ignore-certifcate-errors-spki-list",
        "--disable-blink-features=AutomationControlled"
      ]
    });
    const page = await browser.newPage();

    await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36");
    await page.setExtraHTTPHeaders({
      "accept-language": "en-US,en;q=0.9",
      "sec-fetch-site": "same-origin",
      "sec-fetch-mode": "navigate",
      "sec-fetch-user": "?1",
      "sec-fetch-dest": "document"
    });

    const m3u8Links = [];

    // Listen to network requests
    page.on("request", request => {
      const url = request.url();
      if (url.includes("playlist.m3u8")) {
        m3u8Links.push(url);
      }
    });

    await page.goto(targetUrl, { waitUntil: "networkidle2", timeout: 30000 });

    await new Promise(resolve => setTimeout(resolve, 2000)); // Wait for 2 seconds

    await browser.close();

    res.json({ m3u8Links: [...new Set(m3u8Links)] }); // remove duplicates
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ error: err.message || "Unknown error" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
