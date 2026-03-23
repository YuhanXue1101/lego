import fetch from 'node-fetch';
import * as cheerio from 'cheerio';
const parse = data => {
  const $ = cheerio.load(data);
  const deals = [];

  $('article').each((i, element) => {
    const titleElement = $(element).find('a[class*="thread-title"], a[data-test="thread-title"]');
    let title = titleElement.text().trim();

    // Nouveau : supporte le data-vue3 de Dealabs (JSON encodé dans l'attribut)
    const dataVue3 = $(element).find('div.js-vue3').attr('data-vue3');
    let vue3Data = null;
    if (dataVue3) {
      try {
        vue3Data = JSON.parse(dataVue3);
      } catch (err) {
        vue3Data = null;
      }
    }

    const threadData = vue3Data?.props?.thread || vue3Data?.thread || {};
    if (!title) {
      title = threadData.title || vue3Data?.title || '';
    }

    if (title) {
      // STRATÉGIE MULTI-CIBLES POUR LE PRIX :
      let price = $(element).find('[data-test="thread-price"]').text().trim() || 
                  $(element).find('span[class*="thread-price"]').text().trim() ||
                  $(element).find('.thread-price').text().trim();

      // Nouveau : extraire prix/lien depuis data-vue3 si détecté
      if (vue3Data) {
        price = price || threadData.price || vue3Data.price || threadData.priceText || '';
      }

      // Si toujours rien, on cherche n'importe quel élément qui contient "€"
      if (!price) {
        $(element).find('span, strong, div').each((index, el) => {
          const text = $(el).text().trim();
          // Un prix fait entre 2 et 10 caractères et contient €
          if (text.includes('€') && text.length > 1 && text.length < 15) {
            price = text;
            return false; // Stop la boucle
          }
        });
      }

      let link = titleElement.attr('href') || '';
      if (!link && vue3Data) {
        link = threadData.url || vue3Data.url || threadData.link || '';
      }

      const resolvedLink = link ? (link.startsWith('http') ? link : `https://www.dealabs.com${link}`) : '';

      const safePrice = price != null ? String(price).trim() : '';
      deals.push({
        title,
        price: safePrice ? safePrice.replace(/\s+/g, ' ') : 'N.C',
        link: resolvedLink
      });
    }
  });

  return deals;
};
export const scrape = async url => {
  const response = await fetch(url, {
  headers: {
    'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
    'accept-language': 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7',
    'cache-control': 'no-cache',
    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    'pragma': 'no-cache',
    'sec-ch-ua': '"Chromium";v="122", "Not(A:Brand";v="24", "Google Chrome";v="122"',
    'sec-fetch-dest': 'document',
    'sec-fetch-mode': 'navigate',
    'sec-fetch-site': 'none',
    'sec-fetch-user': '?1',
    'upgrade-insecure-requests': '1'
  }
});

  if (response.ok) {
    const body = await response.text();
    return parse(body);
  }

  console.error(`Error fetching ${url}: ${response.statusText}`);
  return null;
};