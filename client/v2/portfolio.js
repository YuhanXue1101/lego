// Invoking strict mode https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode#invoking_strict_mode
'use strict';

// API Configuration
const API_BASE_URL = 'https://server-zeta-seven-32.vercel.app';

/**
Description of the available api
GET https://lego-api-blue.vercel.app/deals

Search for specific deals

This endpoint accepts the following optional query string parameters:

- `page` - page of deals to return
- `size` - number of deals to return

GET https://lego-api-blue.vercel.app/sales

Search for current Vinted sales for a given lego set id

This endpoint accepts the following optional query string parameters:

- `id` - lego set id to return
*/

// current deals on the page
let currentDeals = [];
let currentVintedSales = [];
let combinedItems = [];
let sourceDeals = [];
let allAvailableIds = []; // Store all available IDs from all data
let currentPagination = {};
let currentFilter = null;
let currentSource = 'all';
let currentDiscount = 'any';
let currentLegoSetId = '';
let currentPage = 1;
let favorites = new Set(JSON.parse(localStorage.getItem('favoriteDeals') || '[]'));

// instantiate the selectors
const selectShow = document.querySelector('#show-select');
const selectPage = document.querySelector('#page-select');
const selectLegoSetIds = document.querySelector('#lego-set-id-select');
const marketplaceList = document.querySelector('#marketplace-list');
const spanNbDeals = document.querySelector('#nbDeals');
const spanNbSales = document.querySelector('#nbSales');
const spanP5 = document.querySelector('#p5Price');
const spanP25 = document.querySelector('#p25Price');
const spanP50 = document.querySelector('#p50Price');
const spanAverage = document.querySelector('#avgPrice');
const spanLifetime = document.querySelector('#lifetimeDays');
const filterBtnCommented = document.querySelector('#filter-commented');
const filterBtnHot = document.querySelector('#filter-hot');
const filterBtnFavorite = document.querySelector('#filter-favorite');
const filterBtns = document.querySelectorAll('.filter-btn');
const selectSort = document.querySelector('#sort-select');
const selectSource = document.querySelector('#source-select');
const selectDiscount = document.querySelector('#discount-select');

// Renomme pour eviter le conflit avec les autres scripts
const extractUniqueIds = items => {
  const ids = items.map(item => item.id || item.setId);
  return ids.filter((id, index) => id && ids.indexOf(id) === index);
};

/**
 * Set global value
 * @param {Array} result - deals to display
 * @param {Object} meta - pagination meta info
 */
const setCurrentDeals = ({result, meta}) => {
  sourceDeals = Array.isArray(result) ? result : [];
  currentPagination = meta || {};
  currentDeals = sourceDeals.map(deal => ({...deal, source: 'dealabs'}));
  
  // Update all available IDs
  const dealsIds = extractUniqueIds(currentDeals);
  const vintedIds = extractUniqueIds(currentVintedSales);
  allAvailableIds = Array.from(new Set([...dealsIds, ...vintedIds])).sort();
  
  rebuildCombinedAndRender();
};

/**
 * Combine deals and vinted sales, apply filters and sorting
 */
const rebuildCombinedAndRender = () => {
  combinedItems = [...currentDeals, ...currentVintedSales];
  combinedItems = filterDeals(combinedItems);
  combinedItems = sortDealsLocal(combinedItems, selectSort.value);
  currentPage = 1;
  render(combinedItems, currentPagination);
};

/**
 * Fetch deals from api
 * @param  {Number}  [page=1] - current page to fetch
 * @param  {Number}  [size=6] - size of the page
 * @param  {String}  [filter=null] - filter type (discount, commented, hot)
 * @return {Object}
 */
const fetchDeals = async (page = 1, size = 6, filter = null) => {
  try {
    // MODIFICATION : Appel a la nouvelle route /deals/search
    // On demande limit=1000 pour que le front-end ait toutes les donnees pour calculer les moyennes
    let url = `${API_BASE_URL}/deals/search?limit=1000`;
    
    if (filter) {
      // L'API attend maintenant filterBy
      url += `&filterBy=${filter}`;
    }
    
    const response = await fetch(url);
    const body = await response.json();

    // MODIFICATION : Le format renvoye par la nouvelle API est { limit, total, results }
    if (body && body.results) {
      return { 
        result: body.results, 
        meta: { total: body.total, page: 1, size: body.total } 
      };
    }

    return {currentDeals, currentPagination};
  } catch (error) {
    console.error(error);
    return {currentDeals, currentPagination};
  }
};

/**
 * Render combined marketplace items with images, badges and favorites
 * @param  {Array} items - Combined deals and Vinted sales
 */
const renderMarketplace = items => {
  if (!items || items.length === 0) {
    marketplaceList.innerHTML = '<li class="empty-message">No items found</li>';
    return;
  }

  marketplaceList.innerHTML = '';
  items.forEach(item => {
    try {
      const isFavorite = favorites.has(item.uuid || item._id || item.id);
      const li = document.createElement('li');
      li.className = 'item';
      li.id = `item-${item.uuid || item._id || item.id}`;
      
      const imageDiv = document.createElement('div');
      const img = document.createElement('img');
      img.className = 'item-image';
      
      let imageUrl = null;
      
      if (item && item.photo && typeof item.photo === 'string' && item.photo.trim() !== '' && item.photo.startsWith('http')) {
        imageUrl = item.photo;
      } else if (item && item.image && typeof item.image === 'string' && item.image.trim() !== '' && item.image.startsWith('http')) {
        imageUrl = item.image;
      } else if (item && item.picture && typeof item.picture === 'string' && item.picture.trim() !== '' && item.picture.startsWith('http')) {
        imageUrl = item.picture;
      } else if (item && item.img && typeof item.img === 'string' && item.img.trim() !== '' && item.img.startsWith('http')) {
        imageUrl = item.img;
      }
      
      img.src = imageUrl || 'https://placehold.co/80x80/9ca3af/ffffff?text=No+Image';
      img.onerror = () => {
        img.src = 'https://placehold.co/80x80/9ca3af/ffffff?text=No+Image';
      };
      imageDiv.appendChild(img);
      
      const contentDiv = document.createElement('div');
      contentDiv.className = 'item-content';
      
      const titleDiv = document.createElement('div');
      titleDiv.className = 'item-title';
      const link = (item && (item.link || item.url)) || '#';
      
      const isVinted = link && typeof link === 'string' && link.includes('vinted.fr');
      const sourceBadge = document.createElement('span');
      sourceBadge.className = 'source-badge';
      sourceBadge.textContent = isVinted ? 'Vinted' : 'Dealabs';
      sourceBadge.style.marginRight = '0.5rem';
      sourceBadge.style.padding = '0.25rem 0.5rem';
      sourceBadge.style.borderRadius = '4px';
      sourceBadge.style.fontSize = '0.75rem';
      sourceBadge.style.fontWeight = '600';
      sourceBadge.style.color = 'white';
      sourceBadge.style.backgroundColor = isVinted ? '#3b82f6' : '#ef4444';
      
      const itemTitle = (item && item.title) || 'Untitled';
      titleDiv.innerHTML = `<a href="${link}" target="_blank" rel="noopener noreferrer">${itemTitle}</a>`;
      titleDiv.insertBefore(sourceBadge, titleDiv.firstChild);
      
      contentDiv.appendChild(titleDiv);
      
      const priceDiv = document.createElement('div');
      priceDiv.className = 'item-price';
      
      // Add metadata (temperature, commentCount, discount) for Dealabs items
      if (item.source === 'dealabs') {
        const metaDiv = document.createElement('div');
        metaDiv.style.fontSize = '0.85rem';
        metaDiv.style.color = '#6b7280';
        metaDiv.style.marginBottom = '0.5rem';
        
        const metaItems = [];
        if (item.temperature !== undefined && item.temperature !== null) {
          const temp = Number(item.temperature);
          metaItems.push(` ${temp.toFixed(1)}C`);
        }
        if (item.comments !== undefined || item.commentCount !== undefined) {
          const coms = item.comments !== undefined ? item.comments : item.commentCount;
          metaItems.push(` ${coms}`);
        }
        if (item.discount && item.discount > 0) {
          metaItems.push(` -${item.discount}%`);
        }
        
        if (metaItems.length > 0) {
          metaDiv.textContent = metaItems.join(' | ');
          priceDiv.appendChild(metaDiv);
        }
      }
      
      const button = document.createElement('button');
      button.className = 'favorite-btn';
      const itemId = item.uuid || item._id || item.id || '';
      button.setAttribute('data-uuid', itemId);
      button.textContent = isFavorite ? '★' : '☆';
      button.addEventListener('click', (e) => {
        e.preventDefault();
        if (favorites.has(itemId)) {
          favorites.delete(itemId);
        } else {
          favorites.add(itemId);
        }
        localStorage.setItem('favoriteDeals', JSON.stringify([...favorites]));
        renderMarketplace(combinedItems);
      });
      
      priceDiv.appendChild(button);
      
      const priceSpan = document.createElement('span');
      priceSpan.style.marginRight = '0.5rem';
      priceSpan.textContent = formatPrice(item);
      priceDiv.insertBefore(priceSpan, button);
      
      li.appendChild(imageDiv);
      li.appendChild(contentDiv);
      li.appendChild(priceDiv);
      marketplaceList.appendChild(li);
    } catch (e) {
      console.error('Erreur sur un item:', e, item);
    }
  });
};

/**
 * Render page selector
 * @param  {Object} pagination
 */
const renderPagination = (pagination, totalItems) => {
  const pageSize = parseInt(selectShow.value) || 6;
  const calculatedPageCount = Math.ceil(totalItems / pageSize) || 1;
  const options = Array.from(
    {'length': calculatedPageCount},
    (value, index) => `<option value="${index + 1}">${index + 1}</option>`
  ).join('');

  selectPage.innerHTML = options;
  selectPage.selectedIndex = Math.min(currentPage - 1, calculatedPageCount - 1);
};

/**
 * Update active filter button styling
 * @param  {String} activeFilter - the current active filter
 */
const updateFilterButtons = (activeFilter) => {
  filterBtns.forEach(btn => {
    btn.classList.remove('active');
    const shouldActive =
      (activeFilter === 'commented' && btn.id === 'filter-commented') ||
      (activeFilter === 'hot' && btn.id === 'filter-hot') ||
      (activeFilter === 'favorite' && btn.id === 'filter-favorite');

    if (shouldActive) {
      btn.classList.add('active');
    }
  });
};

/**
 * Render lego set ids selector with All sets option
 * Filter IDs based on current source selection
 * @param  {Array} deals - list of deals
 */
const renderLegoSetIds = deals => {
  const currentValue = selectLegoSetIds.value;
  
  let ids = [];
  
  if (currentSource === 'dealabs') {
    ids = extractUniqueIds(currentDeals);
  } else if (currentSource === 'vinted') {
    ids = extractUniqueIds(currentVintedSales);
  } else {
    ids = allAvailableIds.length > 0 ? allAvailableIds : extractUniqueIds(deals);
  }
  
  const options = ['<option value="">All sets</option>'].concat(
    ids.map(id => `<option value="${id}">${id}</option>`)
  ).join('');

  selectLegoSetIds.innerHTML = options;
  
  if (currentValue) {
    selectLegoSetIds.value = currentValue;
  }
};

const filterDeals = items => {
  let filtered = [...items];
  
  if (currentSource !== 'all') {
    filtered = filtered.filter(item => item.source === currentSource);
  }
  
  if (currentLegoSetId) {
    filtered = filtered.filter(item => {
      return String(item.id || item.setId || '') === String(currentLegoSetId);
    });
  }

  // Suppression des annonces Dealabs sans prix valide
  filtered = filtered.filter(item => {
    if (item.source === 'dealabs') {
      const price = getSalePrice(item);
      return price !== null;
    }
    return true;
  });
  
  if (currentDiscount !== 'any') {
    const minDiscount = parseInt(currentDiscount);
    filtered = filtered.filter(item => {
      if (item.source === 'dealabs') {
        const itemDiscount = Number(item.discount || 0);
        return itemDiscount >= minDiscount;
      }
      return false; // Cache Vinted car pas de reduction verifiee
    });
  }
  
  if (currentFilter === 'favorite') {
    filtered = filtered.filter(item => {
      return favorites.has(item.uuid || item._id || item.id);
    });
  }
  
  return filtered;
};

const renderIndicators = (items) => {
  const dealsCount = items.filter(item => item.source === 'dealabs').length;
  spanNbDeals.innerHTML = dealsCount;
};

const render = (items, pagination) => {
  const pageSize = parseInt(selectShow.value) || 6;
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedItems = items.slice(startIndex, endIndex);
  
  renderMarketplace(paginatedItems);
  renderPagination(pagination, items.length);
  renderLegoSetIds(combinedItems);
  updateIndicators(items);
};

/**
 * Sort items in browser
 */
const sortDealsLocal = (items, sortValue) => {
  const sorted = [...items];
  console.log('Sorting', sorted.length, 'items by', sortValue, 'currentFilter:', currentFilter);
  
  if (currentFilter === 'hot') {
    return sorted.sort((a, b) => {
      const tempA = Number(a.temperature || 0);
      const tempB = Number(b.temperature || 0);
      return tempB - tempA; 
    });
  }
  
  if (currentFilter === 'commented') {
    return sorted.sort((a, b) => {
      const commentsA = Number(a.commentCount || a.comments || 0);
      const commentsB = Number(b.commentCount || b.comments || 0);
      return commentsB - commentsA; 
    });
  }
  
  switch (sortValue) {
    case 'price-asc':
      return sorted.sort((a, b) => {
        const priceA = getSalePrice(a) || 0;
        const priceB = getSalePrice(b) || 0;
        return priceA - priceB;
      });
    case 'price-desc':
      return sorted.sort((a, b) => {
        const priceA = getSalePrice(a) || 0;
        const priceB = getSalePrice(b) || 0;
        return priceB - priceA;
      });
    case 'date-asc':
      return sorted.sort((a, b) => new Date(b.published || 0) - new Date(a.published || 0));
    case 'date-desc':
      return sorted.sort((a, b) => new Date(a.published || 0) - new Date(b.published || 0));
    default:
      return sorted;
  }
};

const setVintedSalesIndicators = sales => {
  spanNbSales.innerHTML = sales.length;

  const prices = sales
    .map(item => getSalePrice(item))
    .filter(Number.isFinite)
    .sort((a, b) => a - b);

  const percentile = (arr, p) => {
    if (!arr.length) return 0;
    const idx = Math.floor((arr.length - 1) * p);
    return arr[idx];
  };

  const calculateAverage = (arr) => {
    if (!arr.length) return 0;
    const sum = arr.reduce((acc, val) => acc + val, 0);
    return sum / arr.length;
  };

  spanP5.innerHTML = `€${percentile(prices, 0.05).toFixed(2)}`;
  spanP25.innerHTML = `€${percentile(prices, 0.25).toFixed(2)}`;
  spanP50.innerHTML = `€${percentile(prices, 0.5).toFixed(2)}`;
  spanAverage.innerHTML = `€${calculateAverage(prices).toFixed(2)}`;

  const dateStrings = sales.map(item => item.published || item.created || item.publication_date);
  const dates = dateStrings
    .map(d => new Date(d))
    .filter(d => !Number.isNaN(d));

  if (dates.length) {
    const oldest = dates.reduce((a, b) => a < b ? a : b);
    const ageDays = Math.round((Date.now() - oldest.getTime()) / (1000 * 60 * 60 * 24));
    spanLifetime.innerHTML = `${ageDays} days`;
  } else {
    spanLifetime.innerHTML = 'N/A';
  }
};

const updateIndicators = (currentData) => {
  if (!Array.isArray(currentData) || currentData.length === 0) {
    spanNbDeals.innerHTML = '0';
    spanNbSales.innerHTML = '0';
    spanP5.innerHTML = 'N/A';
    spanP25.innerHTML = 'N/A';
    spanP50.innerHTML = 'N/A';
    spanAverage.innerHTML = 'N/A';
    spanLifetime.innerHTML = 'N/A';
    return;
  }

  const dealsItems = currentData.filter(item => item.source === 'dealabs');
  const vintedItems = currentData.filter(item => item.source === 'vinted');

  spanNbDeals.innerHTML = dealsItems.length;
  spanNbSales.innerHTML = vintedItems.length;

  const prices = currentData
    .map(item => getSalePrice(item))
    .filter(priceValue => priceValue !== null && Number.isFinite(priceValue))
    .sort((a, b) => a - b);

  if (prices.length === 0) {
    spanP5.innerHTML = 'N/A';
    spanP25.innerHTML = 'N/A';
    spanP50.innerHTML = 'N/A';
    spanAverage.innerHTML = 'N/A';
  } else {
    const percentile = (arr, p) => {
      if (!arr.length) return null;
      const idx = Math.floor((arr.length - 1) * p);
      return arr[idx];
    };

    const calculateAverage = (arr) => {
      if (!arr.length) return null;
      const sum = arr.reduce((acc, val) => acc + val, 0);
      return sum / arr.length;
    };

    const p5 = percentile(prices, 0.05);
    const p25 = percentile(prices, 0.25);
    const p50 = percentile(prices, 0.5);
    const avg = calculateAverage(prices);

    spanP5.innerHTML = p5 !== null ? `€${p5.toFixed(2)}` : 'N/A';
    spanP25.innerHTML = p25 !== null ? `€${p25.toFixed(2)}` : 'N/A';
    spanP50.innerHTML = p50 !== null ? `€${p50.toFixed(2)}` : 'N/A';
    spanAverage.innerHTML = avg !== null ? `€${avg.toFixed(2)}` : 'N/A';
  }

  const dateStrings = currentData.map(item => item.published || item.created || item.publication_date);
  const dates = dateStrings
    .map(d => {
      const parsed = new Date(d);
      return !Number.isNaN(parsed.getTime()) ? parsed : null;
    })
    .filter(d => d !== null);

  if (dates.length >= 2) {
    const newest = dates.reduce((a, b) => a > b ? a : b);
    const oldest = dates.reduce((a, b) => a < b ? a : b);
    const lifetimeDays = Math.floor((newest.getTime() - oldest.getTime()) / (1000 * 60 * 60 * 24));
    spanLifetime.innerHTML = `${lifetimeDays} days`;
  } else if (dates.length === 1) {
    spanLifetime.innerHTML = '0 days';
  } else {
    spanLifetime.innerHTML = 'N/A';
  }
};

const getSalePrice = (item) => {
  if (!item) return null;

  if (typeof item.price === 'number') return item.price;
  if (typeof item.price === 'string') {
    const normalized = item.price.replace(',', '.').replace(/[€\s]/g, '');
    const parsed = parseFloat(normalized);
    return Number.isFinite(parsed) ? parsed : null;
  }
  if (item.price && typeof item.price === 'object' && item.price.amount) {
    const normalized = String(item.price.amount).replace(',', '.');
    const parsed = parseFloat(normalized);
    return Number.isFinite(parsed) ? parsed : null;
  }
  if (item.amount) {
    const normalized = String(item.amount).replace(',', '.');
    const parsed = parseFloat(normalized);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
};

const formatPrice = (item) => {
  const price = getSalePrice(item);
  if (price === null || price === undefined) {
    return 'N/A';
  }
  return '€' + Number(price).toFixed(2);
};

const renderVintedSales = sales => {
  if (!Array.isArray(sales) || !sales.length) {
    currentVintedSales = [];
    setVintedSalesIndicators([]);
    rebuildCombinedAndRender();
    return;
  }

  currentVintedSales = sales.map(item => ({...item, source: 'vinted'}));
  
  const dealsIds = extractUniqueIds(currentDeals);
  const vintedIds = extractUniqueIds(currentVintedSales);
  allAvailableIds = Array.from(new Set([...dealsIds, ...vintedIds])).sort();
  
  setVintedSalesIndicators(sales);
  rebuildCombinedAndRender();
};

const fetchVintedSales = async legoId => {
  try {
    // ON UTILISE ENFIN LA VARIABLE API_BASE_URL ICI !
    let url = `${API_BASE_URL}/sales/search?limit=1000`;
    
    if (legoId) {
      url += `&legoSetId=${legoId}`;
    }

    console.log("Appel API Vinted vers :", url);

    const response = await fetch(url);
    const body = await response.json();

    // On récupère les résultats
    let sales = body.results || [];
    
    renderVintedSales(sales);

  } catch (error) {
    console.error("Erreur lors de la récupération des ventes :", error);
    renderVintedSales([]);
  }
};

const applyCurrentSort = () => {
  const sortValue = selectSort.value;
  rebuildCombinedAndRender();
};

/**
 * Declaration of all Listeners
 */

const onFilterClick = (filterName) => {
  if (currentFilter === filterName) {
    currentFilter = null;
  } else {
    currentFilter = filterName;
  }
  updateFilterButtons(currentFilter);
  rebuildCombinedAndRender();
};

filterBtnCommented.addEventListener('click', () => onFilterClick('commented'));
filterBtnHot.addEventListener('click', () => onFilterClick('hot'));
filterBtnFavorite.addEventListener('click', () => onFilterClick('favorite'));

selectSource.addEventListener('change', (event) => {
  currentSource = event.target.value;
  currentLegoSetId = ''; // Reset Set ID when source changes
  selectLegoSetIds.value = ''; // Reset the selector
  currentPage = 1; // Reset to page 1
  rebuildCombinedAndRender();
});

selectDiscount.addEventListener('change', (event) => {
  currentDiscount = event.target.value;
  rebuildCombinedAndRender();
});

selectShow.addEventListener('change', (event) => {
  currentPage = 1;
  render(combinedItems, currentPagination);
});

selectPage.addEventListener('change', (event) => {
  currentPage = parseInt(event.target.value);
  render(combinedItems, currentPagination);
});

selectLegoSetIds.addEventListener('change', async event => {
  const legoId = event.target.value;
  currentLegoSetId = legoId;
  
  await fetchVintedSales(legoId);
  rebuildCombinedAndRender();
});

selectSort.addEventListener('change', (event) => {
  console.log('Sort select changed to:', event.target.value);
  applyCurrentSort();
});

document.addEventListener('DOMContentLoaded', async () => {
  // L'appel initial demande tout pour peupler la page
  const deals = await fetchDeals(1, parseInt(selectShow.value));
  setCurrentDeals(deals);
  updateFilterButtons(currentFilter);
  
  await fetchVintedSales('');
  rebuildCombinedAndRender();
});