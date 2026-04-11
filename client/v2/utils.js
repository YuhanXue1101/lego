// Invoking strict mode https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode#invoking_strict_mode
'use strict';


/**
 * 
 * @param {Array} deals - list of deals
 * @returns {Array} list of lego set ids
 */
const getIdsFromDeals = deals => {
    const uniqueIds = new Set();
    
    if (Array.isArray(deals)) {
      deals.forEach(deal => {
        const id = deal.id || deal.setId || deal.legoSetId;
        if (id) {
          uniqueIds.add(String(id));
        }
      });
    }
    
    return Array.from(uniqueIds).sort();
}

/**
 * Extract image URL from item object with multiple fallback paths
 * Supports both Dealabs and Vinted item structures
 * @param {Object} item - marketplace item (deal or vinted sale)
 * @returns {string} image URL or placeholder if not found
 */
const getItemImage = (item) => {
  if (!item) {
    return 'https://placehold.co/80x80/9ca3af/ffffff?text=No+Image';
  }
  
  if (typeof item.photo === 'string' && item.photo.trim().length > 0) {
    if (item.photo.includes('vinted.net') || item.photo.includes('http')) {
      return item.photo;
    }
  }
  
  if (item.photo && typeof item.photo === 'object') {
    const photoUrl = 
      item.photo.url ||
      item.photo.image_url ||
      item.photo.thumb_url ||
      item.photo.high_resolution?.url;
    if (photoUrl && photoUrl.trim().length > 0) {
      return photoUrl;
    }
  }
  
  const fallback = 
    item.image ||
    item.picture ||
    item.img;
  
  if (fallback && typeof fallback === 'string' && fallback.trim().length > 0) {
    return fallback;
  }
  
  return 'https://placehold.co/80x80/9ca3af/ffffff?text=No+Image';
};
