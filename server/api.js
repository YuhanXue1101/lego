import bodyParser from 'body-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';

// We load json files as data source
import SALES from "./sources/vinted.json" with { type: "json" };
import DEALABS_DEALS from "./dealabs_deals.json" with { type: "json" };

const PORT = 8092;

// Extract Lego set ID from deal title
const extractLegoSetId = (title) => {
  if (!title) return null;
  const match = title.match(/\b(\d{5})\b/);
  return match ? match[1] : null;
};

// Fonction utilitaire pour extraire un prix numerique propre
const getPriceValue = (item) => {
  if (!item) return 0;
  if (typeof item.price === 'number') return item.price;
  if (typeof item.price === 'string') {
    const parsed = parseFloat(item.price.replace(',', '.').replace(/[^\d.-]/g, ''));
    return isNaN(parsed) ? 0 : parsed;
  }
  return 0;
};

// Fonction utilitaire pour extraire une date propre pour le tri
const getTimestamp = (dateValue) => {
  if (!dateValue) return 0;
  if (typeof dateValue === 'number') {
    // Les timestamps Dealabs sont parfois en secondes (10 chiffres) au lieu de ms
    if (dateValue < 10000000000) return dateValue * 1000;
    return dateValue;
  }
  const parsed = new Date(dateValue).getTime();
  return isNaN(parsed) ? 0 : parsed;
};

const app = express();

app.use(bodyParser.json());
app.use(cors());
app.use(helmet());

// Middleware global pour configurer les en-tetes CORS sur toutes les routes
app.use((request, response, next) => {
  response.setHeader('Access-Control-Allow-Credentials', true);
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  response.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );
  next();
});

app.get('/', (request, response) => {
  response.send({'ack': true});
});


// ROUTE 1 : GET /deals/search (Recherche et filtres Dealabs)
app.get('/deals/search', (request, response) => {
  try {
    const limit = parseInt(request.query.limit) || 12;
    const priceFilter = parseFloat(request.query.price);
    const dateFilter = request.query.date; // Format attendu: "YYYY-MM-DD"
    const filterBy = request.query.filterBy;
    
    const enrichedDeals = Array.isArray(DEALABS_DEALS) 
      ? DEALABS_DEALS.map(deal => ({
          ...deal,
          id: deal.id || extractLegoSetId(deal.title)
        }))
      : [];
    
    const uniqueDeals = [];
    const seenLinks = new Set();

    for (const deal of enrichedDeals) {
      if (deal.link && !seenLinks.has(deal.link)) {
        seenLinks.add(deal.link);
        uniqueDeals.push(deal);
      }
    }
    
    let filteredDeals = [...uniqueDeals];

    // Filtre par prix maximum
    if (!isNaN(priceFilter)) {
      filteredDeals = filteredDeals.filter(d => getPriceValue(d) <= priceFilter);
    }

    // Filtre par date
    if (dateFilter) {
      filteredDeals = filteredDeals.filter(d => {
        const ts = getTimestamp(d.published || d.created);
        if (ts === 0) return false;
        const dateStr = new Date(ts).toISOString().split('T')[0];
        return dateStr === dateFilter;
      });
    }

    // Tri (Sorting)
    if (filterBy === 'best-discount') {
      filteredDeals.sort((a, b) => (Number(b.discount) || 0) - (Number(a.discount) || 0));
    } else if (filterBy === 'most-commented') {
      filteredDeals.sort((a, b) => (Number(b.comments) || Number(b.commentCount) || 0) - (Number(a.comments) || Number(a.commentCount) || 0));
    } else {
      // Par defaut : prix croissant (ascending way)
      filteredDeals.sort((a, b) => getPriceValue(a) - getPriceValue(b));
    }

    const total = filteredDeals.length;
    const results = filteredDeals.slice(0, limit);
    
    // Format de sortie exact demande par le TP
    return response.status(200).json({
      limit,
      total,
      results
    });
  } catch (error) {
    console.log(error);
    return response.status(500).send({ limit: 0, total: 0, results: [] });
  }
});

// ROUTE 2 : GET /deals/:id (Recuperer un deal specifique)
app.get('/deals/:id', (request, response) => {
  try {
    const { id } = request.params;
    
    const enrichedDeals = Array.isArray(DEALABS_DEALS) 
      ? DEALABS_DEALS.map(deal => ({
          ...deal,
          id: deal.id || extractLegoSetId(deal.title)
        }))
      : [];

    const deal = enrichedDeals.find(d => d.uuid === id || d._id === id || d.id === id);

    if (deal) {
      return response.status(200).json(deal);
    } else {
      return response.status(404).json({ error: "Deal not found" });
    }
  } catch (error) {
    console.log(error);
    return response.status(500).send({ error: "Internal server error" });
  }
});

// ROUTE 3 : GET /sales/search (Recherche Vinted)
app.get('/sales/search', (request, response) => {
  try {
    const limit = parseInt(request.query.limit) || 12;
    const { legoSetId } = request.query;
    
    let result = [];
    if (legoSetId) {
      const items = SALES[legoSetId] || [];
      if (Array.isArray(items)) {
        result = items.map(item => ({
          ...item,
          id: legoSetId,
          source: 'vinted'
        }));
      }
    } else {
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

    const uniqueSales = [];
    const seenLinks = new Set();

    for (const item of result) {
      const itemLink = item.url || item.link; 
      
      if (itemLink && !seenLinks.has(itemLink)) {
        seenLinks.add(itemLink);
        uniqueSales.push(item);
      } else if (!itemLink) {
        uniqueSales.push(item);
      }
    }

    // Tri : date la plus recente en premier (descending way)
    uniqueSales.sort((a, b) => getTimestamp(b.published || b.created || b.publication_date) - getTimestamp(a.published || a.created || a.publication_date));

    const total = uniqueSales.length;
    const results = uniqueSales.slice(0, limit);

    // Format de sortie exact demande par le TP
    return response.status(200).json({
      limit,
      total,
      results
    });
  } catch (error) {
    console.log(error);
    return response.status(500).send({ limit: 0, total: 0, results: [] });
  }
});

app.listen(PORT, () => {
  console.log(`📡 Running on port ${PORT}`);
});

// Indispensable pour que Vercel puisse "attraper" ton application Express
export default app;