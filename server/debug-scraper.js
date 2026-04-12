import fetch from 'node-fetch';
import * as cheerio from 'cheerio';

async function debug() {
  try {
    const response = await fetch('https://www.dealabs.com/groupe/lego', {
      headers: {
        'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'accept-language': 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7',
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      }
    });

    const html = await response.text();
    const $ = cheerio.load(html);

    console.log('=== DEBUGGING DEALABS HTML ===\n');
    
    // Prenez le premier article
    const article = $('article').first();
    
    console.log('📌 Premier article trouvé:\n');
    console.log('HTML complet du premier article:');
    console.log(article.html());
    
    console.log('\n\n📌 Recherche de data-vue3:');
    const dataVue3 = article.find('div.js-vue3').attr('data-vue3');
    if (dataVue3) {
      try {
        const parsed = JSON.parse(dataVue3);
        console.log('data-vue3 parsed:');
        console.log(JSON.stringify(parsed, null, 2).substring(0, 1000) + '...');
      } catch (e) {
        console.log('Erreur parsing data-vue3');
      }
    } else {
      console.log('❌ Pas de data-vue3 trouvé');
    }

    console.log('\n\n📌 Recherche d\'images:');
    article.find('img').each((i, el) => {
      console.log(`Image ${i}:`);
      console.log('  src:', $(el).attr('src'));
      console.log('  data-src:', $(el).attr('data-src'));
      console.log('  class:', $(el).attr('class'));
      console.log('  HTML:', $.html(el).substring(0, 200));
    });

    process.exit(0);
  } catch (e) {
    console.error('Erreur:', e.message);
    process.exit(1);
  }
}

debug();
