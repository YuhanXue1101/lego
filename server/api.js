import bodyParser from 'body-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';

// We load json files as data source
import SALES from "./sources/vinted.json" with { type: "json" };
import DEALABS_DEALS from "./dealabs_deals.json" with { type: "json" };

const PORT = 8092;

// Extract Lego set ID from deal title
// Looks for patterns like "42197", "60415", etc
const extractLegoSetId = (title) => {
  if (!title) return null;
  // Match 5 digit numbers that typically represent Lego set IDs
  const match = title.match(/\b(\d{5})\b/);
  return match ? match[1] : null;
};

const app = express();

app.use(bodyParser.json());
app.use(cors());
app.use(helmet());
app.use(cors())

app.get('/', (request, response) => {
  response.send({'ack': true});
});

app.get('/sales/search', (request, response) => {
  response.setHeader('Access-Control-Allow-Credentials', true)
  response.setHeader('Access-Control-Allow-Origin', '*')
  response.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT')
  response.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  )

  try {
    const { legoSetId } = request.query;
    
    let result = [];
    if (legoSetId) {
      // Get items for specific set ID
      const items = SALES[legoSetId] || [];
      if (Array.isArray(items)) {
        result = items.map(item => ({
          ...item,
          id: legoSetId,
          source: 'vinted'
        }));
      }
    } else {
      // Get all items from all sets
      Object.entries(SALES).forEach(([setId, items]) => {
        if (Array.isArray(items)) {
          result = result.concat(items.map(item => ({
            ...item,
            id: setId,
            source: 'vinted'
          })));
        }
      });
    }

    // Nettoyage des doublons Vinted
    const uniqueSales = [];
    const seenLinks = new Set();

    for (const item of result) {
      // Vinted utilise generalement 'url' ou 'link'
      const itemLink = item.url || item.link; 
      
      if (itemLink && !seenLinks.has(itemLink)) {
        seenLinks.add(itemLink);
        uniqueSales.push(item);
      } else if (!itemLink) {
        // Securite: si un objet n'a pas de lien, on le garde par precaution
        uniqueSales.push(item);
      }
    }

    return response.status(200).json({
      'success': true,
      'data': {'result': uniqueSales}
    });
  } catch (error) {
    console.log(error);
    return response.status(404).send({
      'success': false,
      'data': {'result': []}
    });
  }
});


app.get('/deals', (request, response) => {
  response.setHeader('Access-Control-Allow-Credentials', true)
  response.setHeader('Access-Control-Allow-Origin', '*')
  response.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT')
  response.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  )

  try {
    // Enrichissement des deals
    const enrichedDeals = Array.isArray(DEALABS_DEALS) 
      ? DEALABS_DEALS.map(deal => ({
          ...deal,
          id: deal.id || extractLegoSetId(deal.title)
        }))
      : [];
    
    // Nettoyage des doublons (Deduplication)
    const uniqueDeals = [];
    const seenLinks = new Set();

    for (const deal of enrichedDeals) {
      if (deal.link && !seenLinks.has(deal.link)) {
        seenLinks.add(deal.link);
        uniqueDeals.push(deal);
      }
    }
    
    // Envoi des deals uniques au site web
    return response.status(200).json({
      'success': true,
      'data': {
        'result': uniqueDeals,
        'meta': {
          'total': uniqueDeals.length
        }
      }
    });
  } catch (error) {
    console.log(error);
    return response.status(404).send({
      'success': false,
      'data': {'result': []}
    });
  }
});


app.listen(PORT)

console.log(`📡 Running on port ${PORT}`);
