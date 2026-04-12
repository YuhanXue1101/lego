/* eslint-disable no-console, no-process-exit */
import * as vinted from './websites/vinted.js';
import fs from 'fs'; 

// Common Lego set numbers to scrape (extracted from Dealabs data)
const LEGO_SETS_TO_SCRAPE = [
  '60415', '43217', '75645', '72042', '42209', '76467', '76304', 
  '76463', '72039', '75379', '76451', '75638', '42179', '76785',
  '71857', '76313', '71858', '76470', '75434', '75403', '31167',
  '75452', '60498', '60488', '77255', '76317', '72041', '77254'
];

async function scrapeVintedSets() {
  try {
    console.log('🕵️‍♀️  Scraping Vinted for multiple Lego sets...\n');
    
    const allSales = {};
    let successCount = 0;
    let errorCount = 0;
    
    for (const setId of LEGO_SETS_TO_SCRAPE) {
      try {
        console.log(`📌 Scraping set ${setId}...`);
        const salesBySetId = await vinted.scrape(setId);
        
        // Merge results (grouped by Set ID)
        if (salesBySetId && Object.keys(salesBySetId).length > 0) {
          for (const [id, items] of Object.entries(salesBySetId)) {
            if (Array.isArray(items) && items.length > 0) {
              if (!allSales[id]) {
                allSales[id] = [];
              }
              allSales[id] = allSales[id].concat(items);
              console.log(`  ✓ ${items.length} items found for Set ID ${id}`);
              successCount++;
            }
          }
        } else {
          console.log(`  ○ No items found for ${setId}`);
        }
      } catch (e) {
        errorCount++;
        console.log(`  ✗ Error scraping ${setId}: ${e.message}`);
      }
      
      // Delay between requests to be nice to Vinted API
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    // Save to vinted.json
    const data = JSON.stringify(allSales, null, 2);
    fs.writeFileSync('./sources/vinted.json', data);
    
    console.log(`\n✅ Scraping complete!`);
    console.log(`   Sets successfully scraped: ${successCount}`);
    console.log(`   Sets with errors: ${errorCount}`);
    console.log(`   Total items: ${Object.values(allSales).reduce((sum, arr) => sum + (Array.isArray(arr) ? arr.length : 0), 0)}`);
    console.log(`   Saved to sources/vinted.json`);
    
    process.exit(0);
  } catch (e) {
    console.error('Error:', e);
    process.exit(1);
  }
}

scrapeVintedSets();
