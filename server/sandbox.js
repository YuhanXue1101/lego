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
    console.log(` browsing Dealabs: ${website}`);

    const deals = await dealabs.scrape(website);

    // Étape de stockage : on transforme l'objet JS en chaîne JSON
    const data = JSON.stringify(deals, null, 2);
    
    // On écrit le fichier à la racine du dossier server
    fs.writeFileSync('dealabs_deals.json', data);

    console.log(`✅ ${deals.length} deals récupérés et sauvegardés dans dealabs_deals.json`);
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