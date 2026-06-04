import * as fs from 'fs';
import * as path from 'path';
import { exec } from 'child_process';
import { runScraper } from './scraper';
import { evaluateKioskPotential } from './aiFilter';
import { generateHtmlReport } from './reportGen';

async function main() {
  console.log('🚀 TS Scouter: Starting Discovery Process...');

  // 1. Run Scraper
  const rawResults = await runScraper();
  if (rawResults.length === 0) {
    console.log('⚠️ No results found. Exiting.');
    return;
  }

  // 2. Limit data for AI evaluation (e.g., first 40 results to avoid rate limits)
  const LIMIT = 40;
  const sampledResults = rawResults.slice(0, LIMIT);
  console.log(`🤖 AI Analysis: Evaluating ${sampledResults.length} potential leads (limited to ${LIMIT})...`);

  const evaluatedLeads: any[] = [];

  for (const [index, result] of sampledResults.entries()) {
    console.log(`[${index + 1}/${sampledResults.length}] Evaluating: ${result.found_at_mall}...`);
    
    const evaluation = await evaluateKioskPotential(result.scraped_text, result.found_at_mall);
    
    if (evaluation) {
      evaluatedLeads.push({
        ...evaluation,
        found_at_mall: result.found_at_mall,
        source_url: result.source_url
      });
    }

    // Small delay to be safe with AI rate limits
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // 3. Setup output directory
  const outputDir = path.join(process.cwd(), 'output');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const dateStr = new Date().toISOString().split('T')[0];
  const jsonPath = path.join(outputDir, `brands_db_${dateStr}.json`);
  const htmlPath = path.join(outputDir, `report_${dateStr}.html`);
  const indexPath = path.join(outputDir, 'index.html');

  // 4. Save JSON Database
  fs.writeFileSync(jsonPath, JSON.stringify(evaluatedLeads, null, 2), 'utf8');
  console.log(`💾 Data saved to ${jsonPath}`);

  // 5. Generate and Save HTML Report
  await generateHtmlReport(evaluatedLeads, htmlPath);
  
  // 6. Copy to index.html for deployment
  fs.copyFileSync(htmlPath, indexPath);
  console.log(`📄 Created ${indexPath}`);

  // 7. Deploy to Vercel
  console.log('☁️ Deploying to Vercel...');
  
  // Ensure we have a basic vercel.json in the output folder for static hosting if needed,
  // but for simple HTML, Vercel handles it automatically.
  
  exec(`vercel --prod --yes`, { cwd: outputDir }, (error, stdout, stderr) => {
    if (error) {
      console.error(`❌ Deployment Error: ${error.message}`);
      return;
    }
    if (stderr && !stderr.includes('Inspection Requested')) {
      console.warn(`⚠️ Deployment Warning: ${stderr}`);
    }
    console.log('✅ Deployment Successful!');
    console.log('🔗 Vercel Output:');
    console.log(stdout);
  });
}

main().catch((err) => {
  console.error('💥 Application Error:', err);
});
