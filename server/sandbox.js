/* eslint-disable no-console, no-process-exit */
import * as avenuedelabrique from './websites/avenuedelabrique.js';
import * as dealabs from './websites/dealabs.js'; 
import * as vinted from './websites/vinted.js';
import fs from 'fs'; 

async function scrapeADLB (website = 'https://www.avenuedelabrique.com/promotions-et-bons-plans-lego') {
  try {
    console.log(`🕵️‍♀️  browsing ${website} website`);

    const deals = await avenuedelabrique.scrape(website);

    console.log(deals);
    console.log('done');
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

async function scrapeVinted (lego) {
  try {
    console.log(`🕵️‍♀️  scraping lego ${lego} from vinted.fr`);

    const sales = await vinted.scrape(lego);

    console.log(sales);
    console.log('done');
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

async function scrapeDealabs(website = 'https://www.dealabs.com/groupe/lego') {
  try {
    console.log(` browsing Dealabs with pagination: ${website}`);

    let allDeals = [];
    const baseUrl = website.includes('?') ? website : website + '?';
    
    // Scrape multiple pages
    for (let page = 1; page <= 5; page++) {
      const pageUrl = `${baseUrl}${website.includes('?') ? '&' : '?'}page=${page}`;
      console.log(`📄 Page ${page}: ${pageUrl}`);
      
      const pageDeals = await dealabs.scrape(pageUrl);
      
      if (!pageDeals || pageDeals.length === 0) {
        console.log(`⚠️  Page ${page} returned no deals, stopping pagination`);
        break;
      }
      
      allDeals = allDeals.concat(pageDeals);
      console.log(`  ✓ ${pageDeals.length} deals in page ${page} (total: ${allDeals.length})`);
      
      // Small delay between requests to be polite to the server
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    // Étape de stockage : on transforme l'objet JS en chaîne JSON
    const data = JSON.stringify(allDeals, null, 2);
    
    // On écrit le fichier à la racine du dossier server
    fs.writeFileSync('dealabs_deals.json', data);

    console.log(`✅ ${allDeals.length} deals récupérés et sauvegardés dans dealabs_deals.json`);
    process.exit(0);
  } catch (e) {
    console.error(" Erreur lors du scraping de Dealabs :", e);
    process.exit(1);
  }
}
const [,, param] = process.argv;


scrapeDealabs(param); 
// scrapeADLB(param);
// scrapeVinted(param);
