const additionalSupport=[
 ['USPS','Delivery Service','800-275-8777','https://www.usps.com/help/contact-us.htm'],
 ['Chewy','Retail','800-672-4399','https://www.chewy.com/customer-care/orders-payments-and-promotions/orders/chewy-hours-and-contacts/'],
 ['Spectrum','Telecom','833-267-6094','https://www.spectrum.net/page/spectrum-contact-us-version-c','','https://www.spectrum.net/support/general/spectrum-complaint-resolution-were-here-help'],
 ['Bank of America','Financial services','800-432-1000','https://www.bankofamerica.com/customer-service/contact-us/checking-savings/'],
 ['State Farm','Insurance','800-782-8332','https://www.statefarm.com/contact-us'],
 ['GEICO','Insurance','800-207-7847','https://www.geico.com/contact-us/phone/'],
 ['Progressive','Insurance','888-671-4405','https://www.progressive.com/contact-us/'],
 ['Nationwide','Insurance','','https://www.nationwide.com/personal/contact/call-us/'],
 ['Allstate','Insurance','','https://www.allstate.com/claims/catastrophe'],
 ['U.S. Bank','Financial services','800-872-2657','https://www.usbank.com/customer-service/knowledge-base/KB0069914.html','','https://www.usbank.com/customer-service/knowledge-base/KB0249784.html'],
 ['Truist','Financial services','','https://www.truist.com/contact/products-and-services-directory'],
 ['TD Bank','Financial services','','https://www.td.com/us/en/personal-banking/contact-us/'],
 ['Synchrony','Financial services','','https://www.synchrony.com/help/contact-us'],
 ['PNC','Financial services','888-762-2265','https://www.pnc.com/content/dam/digital-assets/en/documents/digital_services_agreement.pdf'],
 ['Choice Hotels','Hotel','','https://www.choicehotels.com/support/customer-service-form'],
 ['Wyndham Hotels & Resorts','Hotel','','https://www.wyndhamhotels.com/contact-us'],
 ['AutoZone','Retail','800-288-6966','https://www.autozone.com/contactus/websiteIssues'],
 ['Toyota','Automotive','','https://www.toyota.com/support/contact-us/'],
 ['Hyundai','Automotive','','https://owners.hyundaiusa.com/us/en/contact-us'],
 ['Dell','Technology','','https://www.dell.com/en-us/shop/lp/contact-us'],
 ['Nike','Retail','800-344-6453','https://about.nike.com/en/company'],
 ['REI','Retail','','https://www.rei.com/help?article=contact-rei'],
 ['Staples','Retail','','https://www.staples.com/sbd/content/about/investorcontact','support@orders.staples.com'],
 ['Office Depot','Retail','800-463-3768','https://help.officedepot.com/'],
 ['Royal Caribbean','Cruise Line','800-256-6649','https://www.portcanaveral.com/cruise/cruise-lines','','https://www.royalcaribbean.com/resources/contact-us'],
 ['Norwegian Cruise Line','Cruise Line','866-234-7350','https://www.ncl.com/contact-us'],
 ['Carnival Cruise Line','Cruise Line','800-764-7419','https://www.portcanaveral.com/cruise/cruise-lines'],
 ['Celebrity Cruises','Cruise Line','888-751-7804','https://www.portcanaveral.com/cruise/cruise-lines'],
 ['Disney Cruise Line','Cruise Line','800-951-3532','https://www.portcanaveral.com/cruise/cruise-lines'],
 ['MSC Cruises','Cruise Line','877-665-4655','https://www.portcanaveral.com/cruise/cruise-lines'],
 ['Princess Cruises','Cruise Line','800-774-6237','https://www.portcanaveral.com/cruise/cruise-lines']
];
for(const [name,sector,phone,source,email='',complaint] of additionalSupport){
 let company=companies.find(c=>contactKey(c[0])===contactKey(name));
 if(!company){company=[name,'',sector,source,'',[]];companies.push(company);}
 company[5].push(['Customer service',email,phone,source]);
 if(complaint)company[5].unshift(['Customer escalation','','',complaint,'Published complaint or post-service contact page']);
}
const patternCandidates=[
 ['Target','Jim Lee','jim.lee@target.com',advocacy+'target-customer-service-contacts/','The Elliott Report lists first.last@target.com for Michael Fiddelke, Jessica Duvall, and Samir Shah.','https://corporate.target.com/about/leadership-team/jim-lee'],
 ['CVS Health','Tilak Mandadi','tilak.mandadi@cvshealth.com','https://www.cvshealth.com/news/media-contacts.html','Ethan Slavin and Tara Burke use first.last@cvshealth.com.','https://investors.cvshealth.com/governance/officers/default.aspx'],
 ['Walmart','John David Rainey','john.rainey@walmart.com',advocacy+'walmart-customer-service-contact-support-via-phone-email-exec-contacts/','The Elliott Report lists first.last@walmart.com for John Furner, Megan Crozier, and David Guggina.','https://corporate.walmart.com/about/leadership/john-david-rainey']
];
for(const [companyName,person,email,evidence,pattern,profile] of patternCandidates){
 const company=companies.find(c=>c[0]===companyName);
 if(company&&!company[5].some(c=>c[1].toLowerCase()===email.toLowerCase())){
  company[5].push(['Inferred executive email',email,'',evidence,person+' · Format evidence 3/4 · Unverified mailbox',pattern,profile]);
 }
}
