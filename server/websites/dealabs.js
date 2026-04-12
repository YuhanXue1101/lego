import fetch from 'node-fetch';
import * as cheerio from 'cheerio';
const parse = data => {
  const $ = cheerio.load(data);
  const deals = [];

  $('article').each((i, element) => {
    const titleElement = $(element).find('a[class*="thread-title"], a[data-test="thread-title"]');
    let title = titleElement.text().trim();

    // Nouveau : supporte le data-vue3 de Dealabs (JSON encodé dans l'attribut)
    const dataVue3 = $(element).find('div.js-vue3').attr('data-vue3');
    let vue3Data = null;
    if (dataVue3) {
      try {
        vue3Data = JSON.parse(dataVue3);
      } catch (err) {
        vue3Data = null;
      }
    }

    const threadData = vue3Data?.props?.thread || vue3Data?.thread || {};
    if (!title) {
      title = threadData.title || vue3Data?.title || '';
    }

    if (title) {
      // STRATÉGIE MULTI-CIBLES POUR LE PRIX :
      let price = $(element).find('[data-test="thread-price"]').text().trim() || 
                  $(element).find('span[class*="thread-price"]').text().trim() ||
                  $(element).find('.thread-price').text().trim();

      // Nouveau : extraire prix/lien depuis data-vue3 si détecté
      if (vue3Data) {
        price = price || threadData.price || vue3Data.price || threadData.priceText || '';
      }

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

      let link = titleElement.attr('href') || '';
      if (!link && vue3Data) {
        link = threadData.url || vue3Data.url || threadData.link || '';
      }

      const resolvedLink = link ? (link.startsWith('http') ? link : `https://www.dealabs.com${link}`) : '';

      // Extraction de l'image - cherche partout
      let photo = '';
      
      // 1. Cherche dans vue3Data.props.thread.mainImage
      if (vue3Data?.props?.thread?.mainImage) {
        const img = vue3Data.props.thread.mainImage;
        if (img.path && img.name && img.ext) {
          photo = `https://static-pepper.dealabs.com/${img.path}/${img.name}.${img.ext}`;
        }
      }
      
      // 2. Fallback: Cherche dans picture > img (lazy load)
      if (!photo) {
        let imgElement = $(element).find('picture img');
        if (imgElement.length === 0) {
          imgElement = $(element).find('img');
        }
        
        if (imgElement && imgElement.length > 0) {
          // Cherche data-src d'abord (lazy-loading), puis src
          photo = imgElement.attr('data-src') || imgElement.attr('src') || '';
        }
      }
      
      // 3. Fallback: Cherche un style background-image
      if (!photo) {
        $(element).find('[style*="background-image"]').each((idx, el) => {
          const style = $(el).attr('style');
          const match = style.match(/url\(['"]?([^'")]+)['"]?\)/);
          if (match && match[1]) {
            photo = match[1];
            return false;
          }
        });
      }

      const safePrice = price != null ? String(price).trim() : '';
      
    
      
    // Extract temperature and comment count
      let temperature = 0;
      let commentCount = 0;
      let discount = 0;
      
      if (threadData) {
        temperature = threadData.temperature || 0;
        commentCount = threadData.commentCount || 0;
      }

      // STRATEGIE ANTI-ECHEC POUR LA REDUCTION (DISCOUNT)
      
      // 1. Chercher dans les donnees cachees de Dealabs
      if (vue3Data && vue3Data.props && vue3Data.props.thread) {
        const th = vue3Data.props.thread;
        const rawDisc = th.percentage || th.discount || (th.priceInfo && th.priceInfo.percentage);
        if (rawDisc) {
          discount = parseInt(String(rawDisc).replace(/[^0-9]/g, ''));
        }
      }

      // 2. Le Bulldozer (Grace a la capture d'ecran)
      if (!discount || isNaN(discount) || discount === 0) {
        // On recupere absolument tout le texte brut de la carte Dealabs
        const fullText = $(element).text();
        // On cherche un tiret (normal ou tiret long), de 1 a 2 chiffres, puis un %
        const match = fullText.match(/(?:-|−)\s*(\d{1,2})\s*%/);
        if (match && match[1]) {
          discount = parseInt(match[1]);
        }
      }

      // 3. Fallback : chercher dans le titre (ex: via 25% sur la carte)
      if ((!discount || isNaN(discount) || discount === 0) && title) {
        // Cette fois on cherche juste les chiffres avant le % dans le titre
        const titleMatch = title.match(/(\d{1,2})\s*%/);
        if (titleMatch && titleMatch[1]) {
          discount = parseInt(titleMatch[1]);
        }
      }

      // On s'assure d'avoir un vrai nombre propre
      discount = isNaN(discount) ? 0 : discount;

      deals.push({
        title,
        price: safePrice ? safePrice.replace(/\s+/g, ' ') : 'N.C',
        link: resolvedLink,
        photo: photo || null,
        temperature: temperature,
        commentCount: commentCount,
        discount: discount
      });
    }
  });

  return deals;
};
export const scrape = async (baseUrl, maxPages = 3) => {
  const allDeals = [];

  for (let i = 1; i <= maxPages; i++) {
    // Construction de l'URL avec la pagination
    let currentUrl = baseUrl;
    if (i > 1) {
      const separator = baseUrl.includes('?') ? '&' : '?';
      currentUrl = `${baseUrl}${separator}page=${i}`;
    }

    console.log(`Scraping Dealabs - Page ${i}: ${currentUrl}`);

    try {
      const response = await fetch(currentUrl, {
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
        const parsedDeals = parse(body);

        // Si la page est vide, on arrete la boucle
        if (!parsedDeals || parsedDeals.length === 0) {
          console.log("Aucun deal trouve sur cette page, arret de la pagination.");
          break;
        }

        allDeals.push(...parsedDeals);
      } else {
        console.error(`Erreur HTTP sur ${currentUrl}: ${response.statusText}`);
        break; // On arrete pour eviter de spammer une page en erreur
      }

      // Pause d'une seconde entre chaque requete pour eviter le blocage
      if (i < maxPages) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

    } catch (error) {
      console.error(`Exception lors du fetch de ${currentUrl}:`, error);
      break;
    }
  }

  return allDeals;
};