/* Shared, deterministic holiday-deal category routing.
 * Used by the hourly feed builder and both public deal views.
 * Deliberately keeps original product names and source links unchanged.
 */
(function (root) {
  'use strict';
  const aliases = {
    'Computer': 'Computers',
    'Computer Accessories': 'Computers',
    'Toys': 'Toys & Games',
    'Games': 'Toys & Games',
    'Other': 'More deals',
    'Miscellaneous': 'More deals'
  };
  const matches = (value, pattern) => pattern.test(value);
  function resolve(deal) {
    if (typeof deal === 'string') deal = { name: deal };
    deal = deal || {};
    const name = String(deal.name || deal.title || '').normalize('NFKC').toLowerCase();
    const original = String(deal.category || '').trim();
    const prior = aliases[original] || original;

    // A store-wide sale isn't a specific product, even when it mentions a product family.
    if (prior === 'Upcoming sales') return prior;
    if (!name) return prior || 'More deals';

    // Items explicitly sold as a laptop-and-desktop collection belong to the broad category.
    if (matches(name, /\b(?:laptops?|macbooks?|chromebooks?|notebooks?)\b.*\b(?:desktops?|desktop pcs?|all[- ]in[- ]ones?)\b|\b(?:desktops?|desktop pcs?)\b.*\b(?:laptops?|macbooks?|chromebooks?|notebooks?)\b/)) return 'Computers';

    // Keep cases, stands, chargers, docks and replacement parts OUT of the actual-device category.
    const accessory = /\b(?:case|cases|cover|covers|sleeve|sleeves|skin|skins|screen protector|screen guard|keyboard|mouse|mice|dock|docking station|stand|mount|charger|charging cable|adapter|adaptor|power supply|battery replacement|replacement battery|replacement screen|repair kit|replacement parts|bag|backpack|carrying pouch|stylus|pen|folio)\b/;
    if (matches(name, accessory) && matches(name, /\b(?:laptop|notebook|macbook|chromebook|thinkpad|ideapad|vivobook|zenbook|surface laptop|tablet|ipad|iphone|smartphone|phone)\b/)) {
      return matches(name, /\b(?:iphone|smartphone|phone)\b/) ? 'Electronics' : 'Computers';
    }

    // Specific device families take precedence over generic words like gaming, book, home or sale.
    if (matches(name, /\b(?:laptops?|notebook pcs?|chromebooks?|macbooks?|omnibooks?|thinkpads?|ideapads?|vivobooks?|zenbooks?|elitebooks?|probooks?|galaxy book(?:\s?\d+)?|surface laptop|surface book|framework laptop|framework (?:13|16)|pixelbook(?: go)?|lenovo loq (?:14|15|16)|hp victus \d{2}|lg gram|acer swift|acer aspire (?:go|lite|3|5|7)|alienware (?:m|x)\d{2}|asus proart (?:p|px)\d{2}|msi thin|msi modern|msi prestige|hp omen transcend|rog zephyrus|rog strix (?:g|scar)|msi katana|msi cyborg|predator helios|acer nitro|razer blade(?:\s+\d+)?|lenovo legion (?:5|7|9)|hp envy x360|dell latitude|dell inspiron|dell xps \d{2}|asus tuf (?:a|f)\d{2}|yoga (?:7i|9i|slim))\b/)) return 'Laptops';
    if (matches(name, /\b(?:tablets?|ipad(?:s| pro| air| mini)?|galaxy tab|fire hd \d+|surface pro|remarkable 2|kindle scribe)\b/)) return 'Tablets';
    if (matches(name, /\b(?:desktop(?:s| pc)?|mini pcs?|all[- ]in[- ]one pcs?|imacs?|mac minis?|mac studios?|workstations?|monitors?|gaming pcs?|computer(?:s)?|pc parts?|graphics cards?|video cards?|gpus?|cpus?|processors?|motherboards?|ram kits?|memory kits?|ssds?|hard drives?|nvme|pc cases?|external drives?|flash drives?|usb drives?|mechanical keyboards?|gaming keyboards?|gaming mice|routers?|wi[- ]fi mesh|network switches)\b/)) return 'Computers';

    if (matches(name, /\b(?:televisions?|tvs?|qled tv|oled tv|mini[- ]led tv|fire tv|roku tv|smart tv|projectors?|streaming sticks?|chromecast|apple tv 4k|roku streaming)\b/)) return 'TVs';
    if (matches(name, /\b(?:headphones?|headsets?|earbuds?|earphones?|airpods?|soundbars?|speakers?|subwoofers?|amplifiers?|turntables?|record players?|bluetooth audio)\b/)) return 'Audio';
    if (matches(name, /\b(?:smartphones?|cell phones?|mobile phones?|iphones?|pixel (?:[6-9]|10|11)(?:\s|$)|galaxy s\d{2}|galaxy z (?:fold|flip)|oneplus \d{1,2}|moto g(?:\s|$)|nothing phone)\b/)) return 'Phones';
    if (matches(name, /\b(?:smartwatches?|fitness trackers?|apple watch|galaxy watch|garmin (?:fenix|venu|forerunner)|fitbit)\b/)) return 'Electronics';

    if (matches(name, /\b(?:makeup|skincare|skin care|cosmetics?|perfumes?|fragrances?|lipsticks?|mascaras?|shampoos?|conditioners?|hair dryers?|hair stylers?|curling irons?|straighteners?|beauty|shark flexstyle|shark speedstyle|dyson airwrap|dyson supersonic)\b/)) return 'Beauty';
    if (matches(name, /\b(?:gift cards?|e[- ]?gift cards?|store credit)\b/)) return 'Gift Cards';
    if (matches(name, /\b(?:playstation|ps5|ps4|xbox|nintendo|switch 2|nintendo switch|steam deck|rog ally|game consoles?|video games?|gaming controllers?|game pass|pc gaming|console games?)\b/)) return 'Gaming';
    if (matches(name, /\b(?:board games?|puzzles?|lego|hot wheels|barbie|action figures?|plush toys?|tonies|toy(?:s)?|pokemon cards?|trading cards?)\b/)) return 'Toys & Games';
    if (matches(name, /\b(?:refrigerators?|fridges?|dishwashers?|washing machines?|washers?|dryers?|microwaves?|ranges?|ovens?|freezers?|air conditioners?)\b/)) return 'Appliances';
    if (matches(name, /\b(?:coffee makers?|espresso|nespresso|keurig|air fryers?|blenders?|mixers?|cookware|bakeware|crockpots?|slow cookers?|instant pots?|kitchen knives|toasters?|kitchen|food processors?|dinnerware|silverware)\b/)) return 'Kitchen';
    if (matches(name, /\b(?:vacuums?|carpet cleaners?|bedding|bed sheets?|sheet sets?|towels?|blankets?|comforters?|pillows?|mattresses?|furniture|sofas?|couches?|sectionals?|recliners?|desk chairs?|lighting|lamps?|doorbells?|security cameras?|smart home|thermostats?|power tools?|drills?|impact wrenches?|sanders?|leaf blowers?|lawn mowers?|dewalt|ryobi|milwaukee m18|makita)\b/)) return 'Home';

    if (matches(name, /\b(?:shirts?|sweaters?|hoodies?|jeans|pants?|jackets?|dresses?|shoes?|boots?|sneakers?|coats?|handbags?|jewelry|jewellery|necklaces?|earrings?|watches|sunglasses?|clothing|apparel)\b/)) return 'Fashion';
    if (matches(name, /\b(?:groceries|grocery|snacks?|cereals?|coffee beans|sodas?|candy|chocolates?|protein bars?|laundry detergent|dish soap|paper towels?|toilet paper|toothpaste)\b/)) return 'Groceries';
    if (matches(name, /\b(?:pet food|dog food|cat food|pet toys?|litter boxes?|cat litter|dog beds?|pet supplies)\b/)) return 'Pet Supplies';
    if (matches(name, /\b(?:car tires?|dash cams?|car seats?|auto parts?|car batteries|car jump starters?|motor oil)\b/)) return 'Automotive';
    if (matches(name, /\b(?:bikes?|bicycles?|treadmills?|exercise bikes?|dumbbells?|weight sets?|camping|tents?|kayaks?|hiking|sports equipment)\b/)) return 'Sports & Outdoors';
    if (matches(name, /\b(?:printers?|3d printers?|ink cartridges?|toner|digital cameras?|dslrs?|mirrorless cameras?|drone(?:s)?|power banks?|charging stations?|usb[- ]c hubs?|smart plugs?|digital licenses?|software licenses?)\b/)) return 'Electronics';

    // Keep legitimate specific classifications for items the title alone cannot identify.
    return prior || 'More deals';
  }
  function isKnownEnded(deal, now=Date.now()) {
    if(!deal||typeof deal!=='object')return true;
    if(/^(ended|expired|inactive|removed|withdrawn|sold.out|out.of.stock)$/i.test(String(deal.status||'')))return true;
    const value=deal.endsAt ?? deal.expiresAt ?? deal.expirationDate;
    if(!value)return false;
    const str=String(value).trim();
    const end=Date.parse(/^\d{4}-\d{2}-\d{2}$/.test(str)?str+'T23:59:59-05:00':str);
    return Number.isFinite(end)&&now>end;
  }
  function assign(deal) {
    return { ...deal, category: resolve(deal) };
  }
  root.RCLDealCategory = Object.freeze({ resolve, assign, isKnownEnded });
})(typeof window !== 'undefined' ? window : globalThis);
