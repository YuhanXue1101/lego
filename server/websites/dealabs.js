import fetch from 'node-fetch';
import * as cheerio from 'cheerio';
const parse = data => {
  const $ = cheerio.load(data);
  const deals = [];

  $('article').each((i, element) => {
    const titleElement = $(element).find('a[class*="thread-title"], a[data-test="thread-title"]');
    const title = titleElement.text().trim();
    
    if (title) {
      // STRATÉGIE MULTI-CIBLES POUR LE PRIX :
      let price = $(element).find('[data-test="thread-price"]').text().trim() || 
                  $(element).find('span[class*="thread-price"]').text().trim() ||
                  $(element).find('.thread-price').text().trim();

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

      const link = titleElement.attr('href');

      deals.push({
        title,
        price: price.replace(/\s+/g, ' ') || "N.C",
        link: link ? (link.startsWith('http') ? link : `https://www.dealabs.com${link}`) : ''
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