const puppeteer = require("puppeteer");

async function scrapeHindu(query) {
  const url = `https://www.thehindu.com/search/#gsc.tab=0&gsc.q=${encodeURIComponent(query)}&gsc.sort=`;

  let browser;
  try {
    console.log("Launching browser...");
    browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    );

    console.log("Navigating to:", url);
    await page.goto(url, { waitUntil: "networkidle2", timeout: 30000 });

    // Wait for search results to render
    await page.waitForTimeout(5000);

    // Get all <a class="gs-title"> links
    const results = await page.$$eval("a.gs-title", (links) =>
      links.map((link) => ({
        title: link.innerText.trim(),
        url: link.href,
      }))
    );

    console.log("Total results found:", results.length);
    return results.slice(0, 10); // return top 10 results
  } catch (err) {
    console.error("Error scraping The Hindu:", err);
    return [];
  } finally {
    if (browser) await browser.close();
  }
}

// Run directly from CLI
if (require.main === module) {
  const query = process.argv[2] || "India";
  scrapeHindu(query).then((results) => {
    console.log(JSON.stringify(results, null, 2));
  });
}

module.exports = scrapeHindu;
