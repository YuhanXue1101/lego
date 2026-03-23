import * as cheerio from 'cheerio';
import https from 'https';

const url = 'https://www.dealabs.com/groupe/lego';
const body = await new Promise((resolve, reject) => {
  https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, res => {
    let data = '';
    res.on('data', c => data += c);
    res.on('end', () => resolve(data));
  }).on('error', reject);
});

const $ = cheerio.load(body);
const articles = $('article');
console.log('articles', articles.length);
articles.each((i, e) => {
  const a = $(e).find('a[class*=thread-title], a[data-test=thread-title]');
  const d = $(e).find('div.js-vue3');
  const dataVue3 = d.attr('data-vue3');
  console.log(i, 'titleElement', a.text().trim().slice(0,80), 'dataVue3', Boolean(dataVue3));
  if (dataVue3) {
    try {
      const json = JSON.parse(dataVue3);
      console.log('  title', json.thread?.title || json.title);
    } catch (err) {
      console.error('bad json', err.message);
    }
  }
});
