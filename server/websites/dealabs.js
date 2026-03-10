const fetch = require('node-fetch');
const cheerio = require('cheerio');

const parse = data => {
  const $ = cheerio.load(data);

  // On sélectionne tous les articles qui ressemblent à un deal
  return $('article.thread')
    .map((i, element) => {
      const title = $(element).find('a.thread-title').text().trim();
      const price = $(element).find('.thread-price').text().trim();
      const link = $(element).find('a.thread-title').attr('href');

      // On ne retourne l'objet que si on a au moins un titre
      if (title) {
        return { title, price, link };
      }
    })
    .get();
};

module.exports.scrape = async url => {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36'
    }
  });

  if (response.ok) {
    const body = await response.text();
    return parse(body);
  }

  console.error(`Error fetching ${url}: ${response.statusText}`);
  return null;
};