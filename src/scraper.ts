import axios from 'axios';
import * as cheerio from 'cheerio';
import { TARGET_MALLS, KEYWORDS } from './config';

interface ScrapeResult {
  scraped_text: string;
  found_at_mall: string;
  source_url: string;
}

const SLEEP_MS = 2000; // 2 seconds delay between chunks
const CHUNK_SIZE = 5;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchSearchResults(mall: string, keyword: string): Promise<ScrapeResult[]> {
  const query = encodeURIComponent(`${mall} ${keyword}`);
  // Using DuckDuckGo HTML version as it's easier to scrape without JS
  const url = `https://html.duckduckgo.com/html/?q=${query}`;
  
  try {
    const { data } = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });

    const $ = cheerio.load(data);
    const results: ScrapeResult[] = [];

    $('.result__body').each((_, element) => {
      const title = $(element).find('.result__title').text().trim();
      const snippet = $(element).find('.result__snippet').text().trim();
      const link = $(element).find('.result__url').text().trim();

      results.push({
        scraped_text: `${title} - ${snippet}`,
        found_at_mall: mall,
        source_url: link
      });
    });

    return results;
  } catch (error) {
    console.error(`Error scraping ${mall} for ${keyword}:`, error instanceof Error ? error.message : error);
    return [];
  }
}

export async function runScraper(): Promise<ScrapeResult[]> {
  const tasks: { mall: string; keyword: string }[] = [];
  
  // For demonstration, we'll pick a few combinations to avoid massive overhead
  // In production, you might want to iterate all, but carefully
  for (const mall of TARGET_MALLS.slice(0, 5)) { // Limited to first 5 malls for example
    for (const keyword of KEYWORDS.slice(0, 3)) { // Limited to first 3 keywords for example
      tasks.push({ mall, keyword });
    }
  }

  console.log(`Starting scraper with ${tasks.length} total tasks...`);
  
  const allResults: ScrapeResult[] = [];

  for (let i = 0; i < tasks.length; i += CHUNK_SIZE) {
    const chunk = tasks.slice(i, i + CHUNK_SIZE);
    console.log(`Processing chunk ${Math.floor(i / CHUNK_SIZE) + 1}/${Math.ceil(tasks.length / CHUNK_SIZE)}...`);

    const chunkPromises = chunk.map(task => fetchSearchResults(task.mall, task.keyword));
    const settledResults = await Promise.allSettled(chunkPromises);

    settledResults.forEach((result) => {
      if (result.status === 'fulfilled') {
        allResults.push(...result.value);
      }
    });

    if (i + CHUNK_SIZE < tasks.length) {
      console.log(`Sleeping for ${SLEEP_MS}ms to prevent rate limiting...`);
      await sleep(SLEEP_MS);
    }
  }

  console.log(`Scraping complete. Found ${allResults.length} potential leads.`);
  return allResults;
}
