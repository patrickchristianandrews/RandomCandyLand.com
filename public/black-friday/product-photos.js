/* Exact-product photos only. Never substitute category icons or unrelated banners. */
(function(){
  'use strict';
  // Verified product/model photographs. Extra sources are retries if a host blocks hotlinking.
  const exact=Object.freeze({
    'sony-wh1000xm6-black':[
      'https://i5.walmartimages.com/asr/ae4d6fb6-4d87-4090-a5c3-ca9d0c9a49bb.8129a87b67af019674cf1471be7da776.jpeg',
      'https://store.sony.co.nz/dw/image/v2/ABBC_PRD/on/demandware.static/-/Sites-sony-master-catalog/default/dwa951b43d/images/WH1000XM6B/WH1000XM6B_2.png?sh=710&sm=fit&sw=710'
    ],
    'epson-ecotank-et2900-white':'https://mediaserver.goepson.com/adaptivemedia/rendition?assetDescr=ET-2900-wh_left-output_690x460%402x&clid=SAPDAM&id=5e1c29e7adfd71668cc606b074e1cc8d4b51f44f&prclid=banner&prid=1200Wx1200H&vid=5e1c29e7adfd71668cc606b074e1cc8d4b51f44f',
    'garmin-venu4-0100301400':'https://www.staples.ca/cdn/shop/files/29edd12e6444843f08f0df06e467f2fb2ba05fdc_square3138557_1_800x800.jpg?v=1770380133',
    'airpods-pro3':'https://3dnews.ru/assets/external/illustrations/2025/09/09/1128983/Apple-AirPods-Pro-3-1.jpg',
    'oled':'https://i5.walmartimages.com/seo/HP-OmniBook-3-14-2K-OLED-Laptop-Snapdragon-X-16GB-Memory-256GB-SSD-Copilot-PC-Starlit-Blue-DK3R7UA-ABA_001d6997-3b19-45f3-b048-93d52cce396e.35704a1088a49b7339de414b53f360c6.jpeg?odnBg=FFFFFF&odnHeight=640&odnWidth=640',
    'lego-darth-vader-75461':'https://lego.bricksmegastore.com/cdn/shop/files/Front_2df69221-1d43-4c26-8f7a-5a490aeb9595.png?v=1777934484',
    'hot-wheels-mutant-loop-95007325':'https://images.mattel.net/image/upload/w_650%2Cf_auto%2Cc_scale/shop-us-prod/files/c736a06923396cdef6ddf27d709113c9b601aebe.jpg',
    'sonic-forces-switch-77004s':'https://www.tradergames.fr/322719-home_default/sonic-forces-switch-usa-new-enfrdeesit.jpg',
    'ring-starter':'https://pisces.bbystatic.com/image2/BestBuy_US/images/products/f6701a8a-514d-4a27-a567-0e76d189dc18.jpg',
    'lg-c6-65-oled':'https://sonxplus.com/cdn/shop/files/OLED65C6PUA_03_2037x2037.jpg?v=1773326136',
    'ninja':'https://i.ebayimg.com/00/s/MTYwMFgxNjAw/z/cRAAAeSwWNdod6E9/%24_57.JPG?set_id=880000500F',
    'dyson-nural-costco-493383':'https://api-runner.a-ok.app/static/images/p/hero-desktop/aokh8AW4O4dFOMniHntjbdyx372WiYN8DGc8W-hgjdo5i-6mEkuUcUEvcIyCjrBNSzc2mGloj8uj2kfFo-90PWJBOomPb4o48OC-zRs394NIUJ9qhJw_aGfJOhMscm3P1V9drHY-36q2rkIH3BftPSfzL7UeMZRUvdjh0ilnD-ez25az89YwMBuOsu0iIA3ZYoG7p8%3D',
    'lego-advent':'https://lego.bricksmegastore.com/cdn/shop/files/75456-Front_a74d0f7e-0413-44c8-a25a-94fd62ef3135.png?v=1779920478',
    'lego-disney-2026':'https://www.lego.com/cdn/cs/set/assets/blt4281afc1183d702f/43298_boxprod_v29.png?dpr=1&fit=crop&height=800&quality=80&width=800',
    'jbl-charge6-black':'https://www.connoisseur.co.za/cdn/shop/files/JBL_CHARGE_6_BLACK_FRONT_023_x1_resized.png?v=1742810270&width=900',
    'shark-flexstyle':'https://assets.sharkninja.com/image/upload/f_auto/q_auto/SharkNinja-NA/HD442JR_01.jpg',
    'hot-wheels-mega-loop-jhl97':'https://shop.mattel.com/cdn/shop/files/63e6e0e99fe8a4b6092b137c8baa645b5155eea2.jpg?v=1781280985',
    'ryobi-impact':'https://i.ebayimg.com/images/g/rc0AAeSwEQZosfGb/s-l1200.jpg',
    'nespresso-pop':'https://flitit.com/cdn/shop/products/nespresso-home-appliance-nespresso-vertuo-pop-black-coffee-machine-39008216154333.jpg?v=1680178046',
    'kitchenaid-classic-k45ssob':'https://media.kohlsimg.com/is/image/kohls/5689493_Onyx_Black?hei=620&op_sharpen=1&wid=620',
    'bambu-a1-mini-standalone':'https://dasher.sg/cdn/shop/files/A1-mini.png?v=1768203192',
    'tonies-bluey-94989799':'https://us.tonies.com/cdn/shop/files/Bluey-3-Pack-11004172-PLPTB2MainImageTransparent.png?v=1781626242&width=1500',
    'milwaukee-3601-21p':'https://i5.walmartimages.com/seo/Milwaukee-VIPRB-3601-21P-18V-Cordless-5-in-Drill-Driver-2-Ah-550-in-lbs-1700-RPM_dc488e1e-1111-40f5-b8af-daaf805cfb09.ad1fdc66624915ed730afa5bc17b6c01.png?odnBg=FFFFFF&odnHeight=768&odnWidth=768'
  });
  const safeURL=candidate=>{
    if(typeof candidate!=='string')return null;
    if(/^\/black-friday\/product-images\/[a-z0-9_-]+\.(?:jpg|png|webp)$/i.test(candidate))return candidate;
    try{
      const url=new URL(candidate);
      if(url.protocol!=='https:'||/\.(?:svg|gif)$/i.test(url.pathname)||/\b(?:logo|banner|pixel|tracker|tracking|advert)\b/i.test(url.pathname))return null;
      return url.href;
    }catch{return null;}
  };
  const photoURLs=d=>{
    if(!d||typeof d!=='object')return [];
    const set=exact[d.id],local=window.RCLCachedDealPhotos?.[d.id];
    const candidates=[...(local?[local]:[]),...(Array.isArray(set)?set:set?[set]:[]),...(d.imageVerified===true?[d.image]:[])];
    return [...new Set(candidates.map(safeURL).filter(Boolean))];
  };
  const photoURL=d=>photoURLs(d)[0]||null;
  // Try another exact image if one CDN fails; never leave a browser broken-image icon.
  document.addEventListener('error',event=>{
    const img=event.target;
    if(!(img instanceof HTMLImageElement)||!img.matches('.hot-art img, .market-product-art img'))return;
    const candidates=img.dataset.photoSources?(()=>{try{return JSON.parse(img.dataset.photoSources)}catch{return []}})():[];
    const index=Number(img.dataset.photoAttempt||0);
    if(Array.isArray(candidates)&&index+1<candidates.length){
      img.dataset.photoAttempt=String(index+1);
      img.src=candidates[index+1];
    }else if(img.closest('.hot-art')){
      img.remove(); // The existing "Product photo unavailable" message remains visible.
    }else{
      const label=document.createElement('span');
      label.textContent='Product photo unavailable';
      img.replaceWith(label);
    }
    event.stopImmediatePropagation();
  },true);
  window.RCLProductPhotos=Object.freeze({photoURL,photoURLs});
})();
