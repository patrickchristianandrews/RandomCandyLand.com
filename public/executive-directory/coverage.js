const supportCoverage=[
 ['Alphabet / Google','https://support.google.com/'],
 ['Meta','https://www.facebook.com/help/'],
 ['Tesla','https://www.tesla.com/contact'],
 ['JPMorganChase','https://www.chase.com/digital/customer-service','800-935-9935','Chase consumer banking'],
 ['The Walt Disney Company','https://disneyworld.disney.go.com/help/phone/','','Walt Disney World guest assistance'],
 ['Netflix','https://help.netflix.com/en/contactus'],
 ['Visa','https://usa.visa.com/contact-us.html'],
 ['Mastercard','https://www.mastercard.com/us/en/personal/get-support.html'],
 ['Adobe','https://helpx.adobe.com/contact.html'],
 ['Albertsons','https://www.albertsons.com/contact-us.177.html'],
 ['Ahold Delhaize','https://newsroom.foodlion.com/media-contacts','800-210-9569','Food Lion customer care'],
 ['Meijer','https://help.meijer.com/s/contact'],
 ['Dollar General','https://www.dollargeneral.com/customer-support'],
 ['Ross Stores','https://www.rossstores.com/contact-us/'],
 ['Burlington Stores','https://www.burlington.com/helpcenter/contact-us'],
 ['Gap Inc.','https://www.gap.com/customerService/info.do?cid=2136'],
 ['Ulta Beauty','https://www.ulta.com/guestservices/contact-us'],
 ['Tractor Supply','https://www.tractorsupply.com/tsc/cms/customer-service'],
 ['DICK’S Sporting Goods','https://www.dickssportinggoods.com/s/contact-us'],
 ['Academy Sports + Outdoors','https://www.academy.com/help'],
 ['Petco','https://www.petco.com/contact-us'],
 ['BJ’s Wholesale Club','https://www.bjs.com/help/'],
 ['Grocery Outlet','https://www.groceryoutlet.com/contact-us'],
 ['Five Below','https://support.fivebelow.com/hc/en-us/requests/new'],
 ['Bath & Body Works','https://customercare.bathandbodyworks.com/hc/en-us/articles/4410663132819-Contact-Customer-Care'],
 ['American Eagle Outfitters','https://www.ae.com/us/en/content/help/contact-us'],
 ['Abercrombie & Fitch','https://corporate.abercrombie.com/contact-us/'],
 ['RH','https://rh.com/us/en/customer-service'],
 ['Floor & Decor','https://www.flooranddecor.com/contact?fdid=customer-service']
];
for(const [name,url,phone='',label='Published customer support'] of supportCoverage){
 const company=companies.find(c=>c[0]===name);
 if(company&&!company[5].length)company[5].push(['Customer service','',phone,url,label]);
}
