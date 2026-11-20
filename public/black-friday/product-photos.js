/* Exact-product photos only. Do not substitute category icons or unrelated publisher banners. */
(function(){
  'use strict';
  const exact=Object.freeze({
    'sony-wh1000xm6-black':'https://i5.walmartimages.com/asr/ae4d6fb6-4d87-4090-a5c3-ca9d0c9a49bb.8129a87b67af019674cf1471be7da776.jpeg',
    'epson-ecotank-et2900-white':'https://mediaserver.goepson.com/adaptivemedia/rendition?assetDescr=ET-2900-wh_left-output_690x460%402x&clid=SAPDAM&id=5e1c29e7adfd71668cc606b074e1cc8d4b51f44f&prclid=banner&prid=1200Wx1200H&vid=5e1c29e7adfd71668cc606b074e1cc8d4b51f44f',
    'garmin-venu4-0100301400':'https://www.staples.ca/cdn/shop/files/29edd12e6444843f08f0df06e467f2fb2ba05fdc_square3138557_1_800x800.jpg?v=1770380133',
    'airpods-pro3':'https://3dnews.ru/assets/external/illustrations/2025/09/09/1128983/Apple-AirPods-Pro-3-1.jpg'
  });
  const photoURL=d=>{
    if(!d||typeof d!=='object')return null;
    const candidate=exact[d.id]||(d.imageVerified===true?d.image:null);
    if(typeof candidate!=='string')return null;
    try{
      const url=new URL(candidate);
      if(url.protocol!=='https:'||/\.(?:svg|gif)(?:$|\?)/i.test(url.pathname)||/\b(?:logo|banner|pixel|tracking)\b/i.test(url.pathname))return null;
      return url.href;
    }catch{return null;}
  };
  window.RCLProductPhotos=Object.freeze({photoURL});
})();