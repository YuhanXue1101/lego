// Invoking strict mode https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode#invoking_strict_mode
'use strict';

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
let sourceDeals = [];
let currentPagination = {};
let currentFilter = null;
let favorites = new Set(JSON.parse(localStorage.getItem('favoriteDeals') || '[]'));

// instantiate the selectors
const selectShow = document.querySelector('#show-select');
const selectPage = document.querySelector('#page-select');
const selectLegoSetIds = document.querySelector('#lego-set-id-select');
const dealsList = document.querySelector('#deals-list');
const vintedSalesList = document.querySelector('#vinted-sales-list');
const spanNbDeals = document.querySelector('#nbDeals');
const spanNbSales = document.querySelector('#nbSales');
const spanP5 = document.querySelector('#p5Price');
const spanP25 = document.querySelector('#p25Price');
const spanP50 = document.querySelector('#p50Price');
const spanLifetime = document.querySelector('#lifetimeDays');
const filterBtnDiscount = document.querySelector('#filter-discount');
const filterBtnCommented = document.querySelector('#filter-commented');
const filterBtnHot = document.querySelector('#filter-hot');
const filterBtnFavorite = document.querySelector('#filter-favorite');
const filterBtns = document.querySelectorAll('.filter-btn');
const selectSort = document.querySelector('#sort-select');

/**
 * Set global value
 * @param {Array} result - deals to display
 * @param {Object} meta - pagination meta info
 */
const setCurrentDeals = ({result, meta}) => {
  sourceDeals = Array.isArray(result) ? result : [];
  currentPagination = meta || {};
  currentDeals = filterDeals(sourceDeals, currentFilter);
  currentDeals = sortDealsLocal(currentDeals, selectSort.value);
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
    let url = `https://lego-api-blue.vercel.app/deals?page=${page}&size=${size}`;
    
    if (filter) {
      url += `&filter=${filter}`;
    }
    
    const response = await fetch(url);
    const body = await response.json();

    if (body.success !== true) {
      console.error(body);
      return {currentDeals, currentPagination};
    }

    return body.data;
  } catch (error) {
    console.error(error);
    return {currentDeals, currentPagination};
  }
};

/**
 * Render list of deals
 * @param  {Array} deals
 */
const renderDeals = deals => {
  if (!deals || deals.length === 0) {
    dealsList.innerHTML = '<li class="empty-message">No deals found</li>';
    return;
  }

  dealsList.innerHTML = '';
  deals.forEach(deal => {
    const isFavorite = favorites.has(deal.uuid);
    const li = document.createElement('li');
    li.className = 'item';
    li.id = `deal-${deal.uuid}`;
    
    const titleDiv = document.createElement('div');
    titleDiv.className = 'item-title';
    titleDiv.innerHTML = `<a href="${deal.link}" target="_blank" rel="noopener noreferrer">${deal.title}</a>`;
    
    const priceDiv = document.createElement('div');
    priceDiv.className = 'item-price';
    
    const button = document.createElement('button');
    button.className = 'favorite-btn';
    button.setAttribute('data-uuid', deal.uuid);
    button.textContent = isFavorite ? '★' : '☆';
    button.addEventListener('click', (e) => {
      e.preventDefault();
      if (favorites.has(deal.uuid)) {
        favorites.delete(deal.uuid);
      } else {
        favorites.add(deal.uuid);
      }
      localStorage.setItem('favoriteDeals', JSON.stringify([...favorites]));
      renderDeals(currentDeals);
    });
    
    priceDiv.appendChild(button);
    const priceSpan = document.createElement('span');
    priceSpan.style.marginRight = '0.5rem';
    priceSpan.textContent = deal.price;
    priceDiv.insertBefore(priceSpan, button);
    
    li.appendChild(titleDiv);
    li.appendChild(priceDiv);
    dealsList.appendChild(li);
  });
};

/**
 * Render page selector
 * @param  {Object} pagination
 */
const renderPagination = pagination => {
  const {currentPage, pageCount} = pagination;
  const options = Array.from(
    {'length': pageCount},
    (value, index) => `<option value="${index + 1}">${index + 1}</option>`
  ).join('');

  selectPage.innerHTML = options;
  selectPage.selectedIndex = currentPage - 1;
};

/**
 * Update active filter button styling
 * @param  {String} activeFilter - the current active filter
 */
const updateFilterButtons = (activeFilter) => {
  filterBtns.forEach(btn => {
    btn.classList.remove('active');
    const shouldActive =
      (activeFilter === 'discount' && btn.id === 'filter-discount') ||
      (activeFilter === 'commented' && btn.id === 'filter-commented') ||
      (activeFilter === 'hot' && btn.id === 'filter-hot') ||
      (activeFilter === 'favorite' && btn.id === 'filter-favorite');

    if (shouldActive) {
      btn.classList.add('active');
    }
  });
};

/**
 * Render lego set ids selector
 * @param  {Array} lego set ids
 */
const renderLegoSetIds = deals => {
  const ids = getIdsFromDeals(deals);
  const options = ids.map(id => 
    `<option value="${id}">${id}</option>`
  ).join('');

  selectLegoSetIds.innerHTML = options;
};

/**
 * Render page selector
 * @param  {Object} pagination
 */
const filterDeals = deals => {
  if (!currentFilter || currentFilter === 'none') {
    return [...deals];
  }

  return deals.filter(deal => {
    if (currentFilter === 'discount') {
      return Number(deal.discount) > 50;
    }
    if (currentFilter === 'commented') {
      return Number(deal.comments) > 15;
    }
    if (currentFilter === 'hot') {
      return Number(deal.temperature) > 100;
    }
    if (currentFilter === 'favorite') {
      return favorites.has(deal.uuid);
    }
    return true;
  });
};

const renderIndicators = pagination => {
  const {count} = pagination;

  spanNbDeals.innerHTML = Number.isFinite(count) ? count : (currentDeals.length || 0);
};

const render = (deals, pagination) => {
  renderDeals(deals);
  renderPagination(pagination);
  renderIndicators(pagination);
  renderLegoSetIds(deals);
};

/**
 * Helpers: sort deals in browser
 */
const sortDealsLocal = (deals, sortValue) => {
  const sorted = [...deals];
  console.log('Sorting', sorted.length, 'deals by', sortValue);

  switch (sortValue) {
    case 'price-asc':
      return sorted.sort((a, b) => (a.price || 0) - (b.price || 0));
    case 'price-desc':
      return sorted.sort((a, b) => (b.price || 0) - (a.price || 0));
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

  spanP5.innerHTML = `€${percentile(prices, 0.05).toFixed(2)}`;
  spanP25.innerHTML = `€${percentile(prices, 0.25).toFixed(2)}`;
  spanP50.innerHTML = `€${percentile(prices, 0.5).toFixed(2)}`;

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

const getSalePrice = (item) => {
  if (!item) return 0;

  if (typeof item.price === 'number') return item.price;
  if (typeof item.price === 'string') {
    const normalized = item.price.replace(',', '.').replace(/[€\s]/g, '');
    const parsed = parseFloat(normalized);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  if (item.price && typeof item.price === 'object' && item.price.amount) {
    const normalized = String(item.price.amount).replace(',', '.');
    const parsed = parseFloat(normalized);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  if (item.amount) {
    const normalized = String(item.amount).replace(',', '.');
    const parsed = parseFloat(normalized);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  return 0;
};

const renderVintedSales = sales => {
  vintedSalesList.innerHTML = '';
  if (!Array.isArray(sales) || !sales.length) {
    vintedSalesList.innerHTML = '<li class="empty-message">No sales found for this set</li>';
    setVintedSalesIndicators([]);
    return;
  }

  sales.forEach(item => {
    const li = document.createElement('li');
    li.className = 'item';
    const price = getSalePrice(item).toFixed(2);
    const link = item.link || item.url || '#';
    
    const titleDiv = document.createElement('div');
    titleDiv.className = 'item-title';
    titleDiv.innerHTML = `<a href="${link}" target="_blank" rel="noopener noreferrer">${item.title || 'sold item'}</a>`;
    
    const priceDiv = document.createElement('div');
    priceDiv.className = 'item-price';
    priceDiv.textContent = `€${price}`;
    
    li.appendChild(titleDiv);
    li.appendChild(priceDiv);
    vintedSalesList.appendChild(li);
  });

  setVintedSalesIndicators(sales);
};

const fetchVintedSales = async legoId => {
  try {
    let url = `https://lego-api-blue.vercel.app/sales?id=${legoId}`;
    let response = await fetch(url);
    let body = await response.json();

    if (!body || !body.success || !body.data) {
      url = `http://localhost:8092/sales/search?legoSetId=${legoId}`;
      response = await fetch(url);
      body = await response.json();
    }

    const sales = body?.data?.result || [];
    renderVintedSales(sales);
  } catch (error) {
    console.error(error);
    renderVintedSales([]);
  }
};

const applyCurrentSort = async () => {
  const sortValue = document.querySelector('#sort-select').value;
  currentDeals = sortDealsLocal(currentDeals, sortValue);
  render(currentDeals, currentPagination);
};

/**
 * Declaration of all Listeners
 */

/**
 * Filter buttons
 */
const onFilterClick = async (filterName) => {
  currentFilter = filterName;
  updateFilterButtons(currentFilter);
  const pageSize = parseInt(selectShow.value);
  const deals = await fetchDeals(1, pageSize); // fetch raw page and apply local filter
  setCurrentDeals(deals);
  render(currentDeals, currentPagination);
};

filterBtnDiscount.addEventListener('click', () => onFilterClick('discount'));
filterBtnCommented.addEventListener('click', () => onFilterClick('commented'));
filterBtnHot.addEventListener('click', () => onFilterClick('hot'));
filterBtnFavorite.addEventListener('click', () => onFilterClick('favorite'));


/**
 * Select the number of deals to display
 */
selectShow.addEventListener('change', async (event) => {
  const deals = await fetchDeals(currentPagination.currentPage, parseInt(event.target.value));

  setCurrentDeals(deals);
  render(currentDeals, currentPagination);
});

/**
 * Select a specific page to browse
 */
selectPage.addEventListener('change', async (event) => {
  const pageSize = parseInt(selectShow.value);
  const deals = await fetchDeals(parseInt(event.target.value), pageSize);

  setCurrentDeals(deals);
  render(currentDeals, currentPagination);
});

selectLegoSetIds.addEventListener('change', async event => {
  const legoId = event.target.value;
  if (!legoId) {
    renderVintedSales([]);
    return;
  }
  await fetchVintedSales(legoId);
});

selectSort.addEventListener('change', async () => {  console.log('Sort select changed to:', event.target.value);  await applyCurrentSort();
});

document.addEventListener('DOMContentLoaded', async () => {
  const deals = await fetchDeals(1, parseInt(selectShow.value));
  setCurrentDeals(deals);
  updateFilterButtons(currentFilter);
  render(currentDeals, currentPagination);

  if (selectLegoSetIds.value) {
    await fetchVintedSales(selectLegoSetIds.value);
  }
});
