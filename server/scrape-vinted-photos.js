import * as vinted from './websites/vinted.js';
import fs from 'fs';

async function scrapeAndSave() {
  const ids = ['77255', '77251', '40779'];
  const allSales = {};
  
  for (const legoId of ids) {
    try {
      console.log(`🕵️ Scraping legoSetId: ${legoId}`);
      const sales = await vinted.scrape(legoId);
      
      if (sales && sales.length > 0) {
        allSales[legoId] = sales;
        console.log(`✅ Found ${sales.length} items for ${legoId}`);
        console.log(`   Sample item:`, JSON.stringify(sales[0], null, 2));
      }
    } catch (e) {
      console.error(`❌ Error scraping ${legoId}:`, e.message);
    }
  }
  
  if (Object.keys(allSales).length > 0) {
    fs.writeFileSync('sources/vinted-new.json', JSON.stringify(allSales, null, 2));
    console.log(`\n✅ Scraped data saved to sources/vinted-new.json`);
    console.log(`Total IDs: ${Object.keys(allSales).length}`);
  } else {
    console.log('❌ No data scraped');
  }
  
  process.exit(0);
}

scrapeAndSave().catch(e => {
  console.error(e);
  process.exit(1);
});
