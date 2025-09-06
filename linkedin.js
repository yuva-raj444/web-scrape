// linkedinJobs.js
import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";

puppeteer.use(StealthPlugin());

async function scrapeLinkedInJobs(jobRole, location) {
  const url = `https://www.linkedin.com/jobs/${encodeURIComponent(jobRole)}-jobs-${encodeURIComponent(location)}?position=1&pageNum=0`;

  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  // Spoof user-agent
  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
  );

  await page.goto(url, { waitUntil: "networkidle2" });

  // Scroll to load lazy content
  await page.evaluate(() => {
    window.scrollBy(0, window.innerHeight * 3);
  });

  // Wait for job cards
  await page.waitForSelector(".base-card__full-link", { timeout: 15000 });

  // Extract top 10 jobs
  const jobs = await page.$$eval(".base-card__full-link", (cards) =>
    cards.slice(0, 10).map((card) => {
      const title = card.querySelector(".base-search-card__title")?.innerText || "";
      const company = card.querySelector(".base-search-card__subtitle")?.innerText || "";
      const location = card.querySelector(".job-search-card__location")?.innerText || "";
      const link = card.href || "";
      return { title, company, location, link };
    })
  );

  await browser.close();
  return jobs;
}

// Run the scraper
(async () => {
  const jobRole = "web developer";
  const location = "chennai";

  console.log(`🔎 Searching LinkedIn jobs for "${jobRole}" in "${location}"...\n`);
  const results = await scrapeLinkedInJobs(jobRole, location);

  if (results.length === 0) {
    console.log("No jobs found or blocked by LinkedIn.");
  } else {
    console.log("Top Jobs:");
    results.forEach((job, index) => {
      console.log(`${index + 1}. ${job.title} | ${job.company} | ${job.location}`);
      console.log(`   Link: ${job.link}\n`);
    });
  }
})();
