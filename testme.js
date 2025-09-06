// flipkartScraper.js
import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";

puppeteer.use(StealthPlugin());

async function scrapeFlipkart(query) {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  // Set user-agent to avoid bot detection
  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
  );

  const url = `https://www.flipkart.com/search?q=${encodeURIComponent(query)}`;
  await page.goto(url, { waitUntil: "domcontentloaded" });

  // Wait for the product container to load
  await page.waitForSelector("div._1AtVbE, div._75nlfW", { timeout: 10000 });

  // Extract products
  const products = await page.$$eval("div._1AtVbE, div._75nlfW", (cards) =>
    cards
      .map((card) => {
        const title = card.querySelector("div.KzDlHZ")?.innerText || "";
        const price = card.querySelector("div.Nx9bqj._4b5DiR")?.innerText || "Not available";
        const link = card.querySelector("a.CGtC98")?.href || "";
        const image = card.querySelector("img.DByuf4")?.src || "";
        if (!title) return null; // Skip empty titles
        return { title, price, link, image };
      })
      .filter(Boolean)
      .slice(0, 10) // Get top 10 products
  );

  await browser.close();
  return products;
}

// Test the scraper
(async () => {
  const query = "thinlkpad x1 carbon";
  console.log(`🔎 Searching Flipkart for "${query}"...\n`);
  const results = await scrapeFlipkart(query);
  console.log("Top Products:", results);
})();
