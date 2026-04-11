import { parseDomain } from 'parse-domain';
import pkg from 'require-all';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const requireAll = pkg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const websites = requireAll(`${__dirname}/websites`);

export default async link => {
  const {'domain': website} = parseDomain(link);
  const deals = await websites[website].scrape(link);

  return deals;
};
