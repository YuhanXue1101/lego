import { scrape } from './websites/dealabs.js';

const url = 'https://www.dealabs.com/groupe/lego';
const deals = await scrape(url);
console.log('deals', deals && deals.length);
console.log(deals?.slice(0,3));
