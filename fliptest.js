const puppeteer = require("puppeteer");

async function scrapeFlipkart(query) {
  const url = `https://www.flipkart.com/search?q=${encodeURIComponent(query)}`;
  let browser;

  try {
    console.log("Launching browser...");
    browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    );

    console.log("Navigating to:", url);
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });

    // Scroll to load products
    await page.evaluate(() => window.scrollBy(0, window.innerHeight * 3));
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Debug: how many containers
    const containers = await page.$$("a._1fQZEK, a.s1Q9rs");
    console.log("Found product links:", containers.length);

    // Extract products
    const results = await page.$$eval("a._1fQZEK, a.s1Q9rs", (items) =>
      items.map((link) => {
        const title = link.innerText.trim();
        const url = link.href;
        const parent =
          link.closest("._1AtVbE, ._2kHMtA, ._4ddWXP") || link;

        const price =
          parent.querySelector("._30jeq3")?.innerText ||
          parent.querySelector("._1_WHN1")?.innerText ||
          "Not available";

        const image =
          parent.querySelector("img._396cs4")?.src ||
          parent.querySelector("img._2r_T1I")?.src ||
          "";

        const rating =
          parent.querySelector("._3LWZlK")?.innerText ||
          parent.querySelector(".hGSR34")?.innerText ||
          "";

        return { title, price, url, image, rating, source: "Flipkart" };
      })
    );

    console.log("Extracted results:", results.length);
    return results.slice(0, 10);
  } catch (err) {
    console.error("Error scraping Flipkart:", err);
    return [];
  } finally {
    if (browser) await browser.close();
  }
}

// Run directly from CLI
if (require.main === module) {
  const query = process.argv[2] || "laptop";
  scrapeFlipkart(query).then((results) => {
    console.log(JSON.stringify(results, null, 2));
  });
}

module.exports = scrapeFlipkart;
