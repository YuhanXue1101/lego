import * as cheerio from 'cheerio';
import { v5 as uuidv5 } from 'uuid';

const COOKIE="v_udt=ekRwNEJnejVuQTh4S04wQlNXSzA5M0ZUMWprdi0tL0hscVR3eit2WVAzdlc1NC0tMG1Td2ZOc3JUbUtGVUMvMnlzTHA5UT09; anon_id=45233761-6398-4190-99e2-15e5abca602c; anonymous-locale=fr; _lm_id=7MBZX3CVBH2DM5F0; _ga=GA1.1.2104751960.1760357488; __ps_r=https://www.google.com/; __ps_lu=https://www.vinted.fr/; __ps_did=pscrb_893ec5e7-b674-4dfc-db45-3835199eff46; __ps_fva=1760357488153; domain_selected=true; _gcl_au=1.1.1635604676.1768319217; is_shipping_fees_applied_info_banner_dismissed=true; last_user_id=1; anonymous-iso-locale=fr-FR; non_dot_com_www_domain_cookie_buster=1; consent_version=eu; OptanonAlertBoxClosed=2026-04-11T13:44:33.182Z; eupubconsent-v2=CQifnzAQifnzAAcABBFRCaFsAP_gAEPgAAwILNtR_G__bWlr-Tb3abpkeYxP99hr7sQxBgbJk24FzLvW7JwCx2E5NAzatqIKmRIAu3TBIQNlHIDURUCgKIgFryDMaEyUoTNKJ6BkiBMRA2JYCFxvm4pjWQCY4ur_5lc1mB-N7dr82dzyy4hHn3a5fmS1UJCcIYetDfn8ZBKT-9IEd-x8v4v4_EbpEm-eS1n_pGtp4jd6YlM_dBmxt-TyffzPn_frk_e7X_vc_n3zv8oXH77r_4LMgAmGh0QRlkQCBAoCAECABQVhABQIAgAASBogIATBgQ5AwAXWEyAEAKAAYIAQAAgwABAAAJAAhEAEABAIAQIBAoAAwAIAgIAGBgADABYiAQAAgOgYpgQQCBYAJEZVBpgSgAJBAS2VCCQBAgrhCkWOAQQIiYKAAAEAAoAAAB8LAQklBKxIIAuILoAECAAAKIECBFIWYAgoDNFoKwJOAyNMAyfMEySnQZAEwQkZBkQmqCQeKYogAAAA.f_wACHwAAAAA.ILNtR_G__bXlv-Tb36bpkeYxf99hr7sQxBgbJs24FzLvW7JwC32E7NEzatqYKmRIAu3TBIQNtHIjURUChKIgVrzDsaEyUoTtKJ-BkiDMRY2JYCFxvm4pjWQCZ4ur_51d9mT-N7dr-2dzyy5hnv3a9fuS1UJicKYetHfn8ZBKT-_IU9_x-_4v4_MbpEm-eS1v_tGtt43d64tP_dpuxt-Tyffz___f72_e7X__c__33_-qXX_77_4A; OTAdditionalConsentString=2~20.43.55.57.61.70.83.89.93.108.117.122.124.135.143.144.147.149.159.161.184.192.196.211.228.230.236.239.255.259.266.272.286.291.311.313.314.320.322.323.327.358.367.370.371.385.407.415.424.429.430.436.445.469.486.491.494.495.522.523.540.550.560.568.574.576.584.587.591.621.723.737.797.798.803.820.827.839.864.899.904.922.938.955.959.979.981.985.986.1003.1027.1031.1033.1046.1047.1048.1051.1053.1067.1092.1095.1097.1099.1107.1109.1126.1135.1143.1149.1152.1162.1166.1186.1188.1192.1205.1215.1220.1226.1227.1230.1252.1268.1270.1276.1284.1290.1301.1307.1312.1329.1342.1345.1356.1365.1403.1415.1416.1419.1421.1423.1440.1449.1455.1495.1512.1514.1516.1525.1540.1548.1555.1558.1570.1577.1579.1583.1584.1598.1603.1616.1638.1651.1653.1659.1660.1667.1677.1678.1682.1697.1699.1703.1712.1716.1720.1721.1725.1732.1735.1745.1750.1753.1765.1782.1786.1800.1808.1810.1825.1827.1832.1838.1840.1843.1845.1859.1870.1878.1880.1882.1889.1898.1911.1917.1928.1929.1942.1944.1958.1962.1963.1964.1967.1968.1969.1978.1985.1987.2003.2027.2035.2038.2039.2044.2047.2052.2056.2064.2068.2069.2072.2074.2084.2088.2090.2103.2107.2109.2115.2124.2130.2133.2135.2137.2140.2141.2147.2156.2166.2177.2186.2205.2213.2216.2219.2220.2222.2223.2224.2225.2227.2234.2251.2253.2271.2275.2279.2282.2295.2299.2309.2310.2312.2316.2322.2325.2328.2331.2335.2336.2343.2354.2358.2359.2370.2373.2376.2377.2400.2403.2405.2406.2407.2410.2411.2414.2415.2416.2418.2425.2427.2440.2447.2453.2461.2465.2468.2472.2477.2484.2486.2488.2498.2506.2510.2517.2526.2527.2531.2532.2534.2535.2542.2552.2559.2563.2564.2567.2568.2569.2571.2572.2575.2577.2579.2583.2584.2589.2595.2596.2604.2605.2608.2609.2610.2612.2614.2621.2624.2627.2628.2629.2633.2636.2642.2643.2645.2646.2650.2651.2652.2656.2657.2658.2660.2661.2669.2670.2677.2681.2684.2686.2687.2689.2690.2695.2698.2713.2714.2729.2739.2767.2768.2770.2772.2778.2784.2787.2791.2792.2798.2801.2805.2812.2813.2814.2816.2817.2821.2822.2824.2827.2830.2831.2832.2833.2834.2838.2839.2844.2846.2849.2850.2852.2854.2860.2862.2863.2865.2867.2869.2872.2874.2875.2878.2880.2881.2882.2884.2886.2887.2888.2889.2891.2893.2894.2895.2897.2898.2900.2901.2908.2909.2916.2917.2918.2920.2922.2923.2927.2929.2930.2931.2940.2941.2947.2949.2950.2956.2958.2961.2963.2964.2965.2966.2968.2970.2972.2973.2974.2975.2979.2980.2981.2983.2985.2986.2987.2994.2995.2997.2999.3000.3001.3002.3003.3005.3008.3009.3010.3012.3016.3017.3018.3019.3023.3028.3031.3034.3038.3043.3051.3052.3053.3055.3058.3059.3063.3066.3068.3070.3073.3074.3075.3076.3077.3088.3089.3090.3093.3094.3095.3097.3099.3100.3106.3107.3109.3112.3117.3119.3126.3127.3128.3130.3133.3135.3136.3137.3145.3149.3150.3151.3153.3155.3163.3165.3167.3169.3172.3173.3177.3182.3183.3184.3185.3186.3187.3188.3189.3190.3194.3196.3200.3201.3209.3210.3211.3213.3214.3215.3217.3218.3222.3223.3225.3226.3227.3228.3230.3231.3233.3234.3235.3236.3237.3238.3240.3244.3245.3250.3251.3253.3254.3257.3260.3266.3270.3272.3281.3286.3288.3289.3290.3292.3293.3296.3299.3300.3306.3307.3309.3314.3315.3316.3318.3323.3324.3328.3330.3331.3531.3631.3731.3831.4131.4331.4531.4631.4731.4831.5231.6931.7131.7235.7831.7931.8931.9731.10231.10631.10831.11031.11531.11631.13431.13632.14034.14133.14237.14332.15731.16831.16931.21233.21731.23031.25131.25931.26031.26631.26831.27731.27831.28031.28332.28731.28831.29631.30331.30532.30732.32531.33931.34231.34631.34731.36831.39131.39531.40632.41131.41531.43631.43731.43831.45931.47031.47232.47531.48131.49231.49332.49431.50831.52831.54231.56831.56931.57131.57231.57531~dv; refresh_token_web=eyJraWQiOiJFNTdZZHJ1SHBsQWp1MmNObzFEb3JIM2oyN0J1NS1zX09QNVB3UGlobjVNIiwiYWxnIjoiUFMyNTYifQ.eyJhcHBfaWQiOjQsImF1ZCI6ImZyLmNvcmUuYXBpIiwiY2xpZW50X2lkIjoid2ViIiwiZXhwIjoxNzc2NjA2MTcyLCJpYXQiOjE3NzYwMDEzNzIsImlzcyI6InZpbnRlZC1pYW0tc2VydmljZSIsInB1cnBvc2UiOiJyZWZyZXNoIiwic2NvcGUiOiJwdWJsaWMiLCJzaWQiOiJjM2NiZWFjMy0xNzc1OTEyNzczIn0.GqLzaXVD8yCMdc0ZaYNY2h65a3J7zvF4_Y2NFBUNvTBR5Ms9vURx4c1KjYrsW1YG7OMyfW05lWGdEoj8tYdSXjq6wvq1eWxCnLwoTGbEA9Zh0I8gcu9xZ0sR5aT4PCNQVpQyCOsnHqDJ7A9-QkM6ITBFPz2h6dY50MPx-YoC9BHRwJ5YVBaVfrZuBTZY2EbD53M4HDdqwWYidawDK8Xmtk5S4Q_X2fkV5xQbkFTQVLRfxokJ3eGBGKPI7iofr_vFXy3KylBdl69S60-SMfAYF3Se8mPesNKXbvOHrty7b_T0b3vI2jSJ5bMs0HNsdKhJINXYwVYJQloQTMmzsLtYmg; access_token_web=eyJraWQiOiJFNTdZZHJ1SHBsQWp1MmNObzFEb3JIM2oyN0J1NS1zX09QNVB3UGlobjVNIiwiYWxnIjoiUFMyNTYifQ.eyJhcHBfaWQiOjQsImF1ZCI6ImZyLmNvcmUuYXBpIiwiY2xpZW50X2lkIjoid2ViIiwiZXhwIjoxNzc2MDA4NTcyLCJpYXQiOjE3NzYwMDEzNzIsImlzcyI6InZpbnRlZC1pYW0tc2VydmljZSIsInB1cnBvc2UiOiJhY2Nlc3MiLCJzY29wZSI6InB1YmxpYyIsInNpZCI6ImMzY2JlYWMzLTE3NzU5MTI3NzMifQ.vpj2YsExvJF0t--dT3kAxuwKymWReD-5mT4rUL6a2qnv5kMckChhVY85nZGX1Oie-uOUm6yRdXy4eukEb4fBSM7N0b87rJNv9PrKsAFM7UiZ_O0AmMbXxEbsLQgQJAM4aEpb4J6Q183ZfZqm7lDtvV9NzNxi1z7pWlTVbnot6nFtuyL1WqFxx8rhC_1AtwVLddobjF4fOGV-FqWIw500tXAmzpafk8QIPWdZZgk4opM0vYGGVDwE3Rl9yJLSpdlZNVJvpd-fPgHid6QOYnhk1fiuRhgkSBhSGvaOUDcEf_WsaLaq8iVAtsnD7YS7bKZE_rFYKeJKmvl1TPWf5pSi0w; v_sid=c3cbeac3-1775912773; v_sid=c3cbeac3-1775912773; cf_clearance=geL_nvegpvVSKxEts2wXWjj2NyRjhHWxYDGq6G4HPCM-1776004934-1.2.1.1-QKHldckf56NJk6D5KSyCoyn.uNXMzFJwectdR.bNzpqP4eZKmtFM8JG1pewhfpSuJ7tSOAtGb4L2pRpKvCLxP9OoYzuC4VhMA3v5dnyn.TDnOCpPH5wF5p8liprltvDPiw69JCGKQeGMECtOq0MMwKxuuiwJCBPO12klvbFdKXZi.ag10JvA_zBMC8dz3rsHY_W5Y_KrdIg.DKVXflzvQDtDi70aQMTvntPqyvXLw4w.fZ7dslUcqpF_4vYZcBnuGN.8MYccUrSHSuP9mtqfnMS2k6X.g8b8RBvFgQiJVvbgoRg5AGnB1wEqwyYOGWoYHsT1rJijl470C6dH0UlZ4g; __cf_bm=FS8GG6.3j6BTnDNdzG4unySAtuDF9UBBE9HrMILj_6U-1776004934.3999758-1.0.1.1-3cmLVUBTQ_fytu3vnzBsecyM49aWwYs9Vk.fz5.VlimiF2fmQmHu8P6fzJXCWyDNiJeH.NJUKjGuUBAtkK_Zb25Zvj6WqTzInU7044_tGjSCBozP8BjOcGLs0Gt423KQNViMk.jIFO2_ar2LbFP5Xg; __ps_sr=_; __ps_slu=https://www.vinted.fr/items/8552415023-ensemble-le-ninjago-neuf; viewport_size=479; banners_ui_state=SUCCESS; _vinted_fr_session=dXJsMFpoUCtSSWxyOUNSZUFTUVYxVWJYa0FiYmMyR1pjWWx4THlQRlNZbE9qTkgyeEtqbXcwTnltc0Q2U0NOZGpIclI4a3ZzWlF0WFFDeHcrVGZqL3QrWkFpc1pOSWZESW5PTE4yMWRTaGFXWVhDbTAvOUNobTdhVUZtTWdUenBHL0JEVzQ0MWJTb2loMHF1c3hHLzlmOWM3WmdFUXQvUC9XOGV3YURXbUZKS0NjMCtrK3ByWlcwSExmTWlBUktCdy92WDBIa0c3cDluOHRYMlBtU1U1cFY4bmtuSDYwU0FIcm1FOXV5TG1KMD0tLTlIMmVjN3JTNncvSzR5QXBxM21oUHc9PQ%3D%3D--679169052fd9e3223b9d7cbb85cb4f102568c749; OptanonConsent=isGpcEnabled=0&datestamp=Sun+Apr+12+2026+16%3A53%3A12+GMT%2B0200+(heure+d%E2%80%99%C3%A9t%C3%A9+d%E2%80%99Europe+centrale)&version=202602.1.0&browserGpcFlag=0&isIABGlobal=false&consentId=45233761-6398-4190-99e2-15e5abca602c&identifierType=Cookie+Unique+Id&isAnonUser=1&hosts=&interactionCount=4&landingPath=NotLandingPage&groups=C0001%3A1%2CC0002%3A1%2CC0003%3A1%2CC0004%3A0%2CC0005%3A1%2CV2STACK42%3A1%2CC0035%3A1%2CC0038%3A1&genVendors=V5%3A1%2CV2%3A1%2CV1%3A1%2C&intType=1&geolocation=FR%3BIDF&AwaitingReconsent=false&prevHadToken=0&crTime=1775915089492; _ga_8H12QY46R8=GS2.1.s1776004938$o15$g1$t1776005593$j24$l0$h0; _ga_ZJHK1N3D75=GS2.1.s1776004938$o16$g1$t1776005593$j39$l0$h0; datadome=lcFa5vs10XxVlTtG3uUAoAy9JAYghEZMYkusFNLEwSF_53pfge81B2TZclTb_fwi2L2c54DPjAxL8ikDwWqQ_IIVCHOKAi2DEK5swdBoV1ya_Rq3Vhxd5D2LwIGpRhB5"

function isNotDefined(value) {
  return (value == null || (typeof value === "string" && value.trim().length === 0));
}

/**
 * Extract Lego set ID from title
 * Looks for 5-digit numbers that represent Lego set IDs
 * @param {String} title - article title
 * @return {String|null} set ID or null
 */
const extractSetIdFromTitle = (title) => {
  if (!title || typeof title !== 'string') return null;
  
  // Look for 5-digit patterns like 40779, 77251, 75645
  const match = title.match(/\b(\d{5})\b/);
  return match ? match[1] : null;
};

/**
 * Extract additional info from title (brand name, condition, etc)
 * @param {String} title - article title
 * @return {Object} extracted info
 */
const extractTitleInfo = (title) => {
  const info = {
    setId: extractSetIdFromTitle(title),
    title: title
  };
  
  // Look for condition keywords (like "neuf", "occasion", "like new")
  const conditionMatch = title.match(/\b(neuf|nouveau|occasion|comme neuf|bon état|used|new)\b/i);
  if (conditionMatch) {
    info.condition = conditionMatch[1];
  }
  
  return info;
};

/**
 * Parse Vinted API response and group by Set ID
 * @param  {Object} data - json response from Vinted API
 * @return {Object} sales grouped by set ID (including "Autre" for unknown)
 */
const parse = data => {
  try {
    const {items} = data;
    if (!items || items.length === 0) {
      return {};
    }

    if (items.length > 0) {
      console.log("🔍 Premier article Vinted:", JSON.stringify(items[0], null, 2));
      console.log("📸 Photo object:", JSON.stringify(items[0].photo, null, 2));
    }

    // Group items by Set ID
    const groupedBySetId = {};

    items.forEach((item, idx) => {
      const link = item.url;
      const price = item.total_item_price || item.price;
      const photo = item.photo;
      const title = item.title;
      
      let published = null;
      if (photo) {
        published = 
          photo.high_resolution?.timestamp ||
          photo.timestamp ||
          Date.now();
      }
      
      let photoUrl = null;
      if (photo) {
        photoUrl = 
          photo.url ||
          photo.high_resolution?.url ||
          photo.image_url ||
          photo.thumb_url ||
          null;
      }
      
      if (!photoUrl && idx < 3) {
        console.warn(`⚠️  Article ${idx} n'a pas de photo. Photo object:`, photo);
      }

      // Extract Set ID from title
      const setId = extractSetIdFromTitle(title) || 'Autre';
      
      const articleData = {
        link,
        price,
        photo: photoUrl,
        title: title,
        published,
        'uuid': uuidv5(link, uuidv5.URL)
      };

      // Initialize array for set ID if needed
      if (!groupedBySetId[setId]) {
        groupedBySetId[setId] = [];
      }
      
      groupedBySetId[setId].push(articleData);
    });

    console.log(`📊 Articles groupés par Set ID: ${Object.keys(groupedBySetId).join(', ')}`);
    return groupedBySetId;
    
  } catch (error){
    console.error(error);
    return {};
  }
};



const scrape = async searchText => {
  try {

    if (isNotDefined(COOKIE)) {
      throw "vinted requires a valid cookie";
    }

    const response = await fetch(`https://www.vinted.fr/api/v2/catalog/items?page=1&per_page=96&time=1727382549&search_text=${searchText}&catalog_ids=&size_ids=&brand_ids=89162&status_ids=6,1&material_ids`, {
      "headers": {
        "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
        "accept-language": "fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7",
        "cache-control": "no-cache",
        "pragma": "no-cache",
        "priority": "u=0, i",
        "sec-ch-ua": "\"Google Chrome\";v=\"129\", \"Not=A?Brand\";v=\"8\", \"Chromium\";v=\"129\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"macOS\"",
        "sec-fetch-dest": "document",
        "sec-fetch-mode": "navigate",
        "sec-fetch-site": "none",
        "sec-fetch-user": "?1",
        "upgrade-insecure-requests": "1",
        "cookie": COOKIE
      },
      "referrerPolicy": "strict-origin-when-cross-origin",
      "body": null,
      "method": "GET"
    });

    if (response.ok) {
      const body = await response.json();

      return parse(body);
    }

    console.error(response);

    return null;
  } catch (error) {
    console.error(error);
    return null;
  }
};


export {scrape};