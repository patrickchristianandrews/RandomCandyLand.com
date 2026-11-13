const advocacy='https://www.elliott.org/company-contacts/';
const escalationSources={
 Amazon:['amazon','ecr-replies@amazon.com','cs-escalations@amazon.com',['Andy Jassy','ajassy@amazon.com'],['Doug Herrington','dherrington@amazon.com']],
 Walmart:['walmart-customer-service-contact-support-via-phone-email-exec-contacts','','',['John Furner','john.furner@walmart.com'],['David Guggina','david.guggina@walmart.com']],
 Target:['target-customer-service-contacts','','',['Samir Shah','samir.shah@target.com'],['Michael Fiddelke','michael.fiddelke@target.com']],
 'The Home Depot':['home-depot','','',['Jordan Broggi','jordan_broggi@homedepot.com'],['Ted Decker','edward_decker@homedepot.com']],
 'Lowe’s':['lowes','','',['Ronda Harlow','ronda.harlow@lowes.com'],['Marvin Ellison','marvin.ellison@lowes.com']],
 'Best Buy':['best-buy','BestBuyCorporateTeam@bestbuy.com','',['Haley Hanes','haley.hanes@bestbuy.com'],['Jason Bonfig','jason.bonfig@bestbuy.com']],
 'CVS Health':['cvs-health','executiveoffice@cvshealth.com','',['Prem Shah','prem.shah@cvshealth.com'],['David Joyner','David.Joyner@cvshealth.com']],
 Walgreens:['walgreens-customer-service-contacts','wcrexecresponse@walgreens.com','',['Rebekah Pajak','rebekah.pajak@walgreens.com'],['Michael Motz','michael.motz@walgreens.com']],
 'Macy’s':['macy-s-customer-service-contacts','','',['Jeffrey Warren','jeffrey.warren@macys.com'],['Tony Spring','tony.spring@macys.com']],
 Wayfair:['wayfair-customer-service-contacts','','',['Niraj Shah','nshah@wayfair.com']],
 Apple:['apple','','',['John Ternus','jternus@apple.com']],
 eBay:['ebay-customer-service-contacts','','',['Julie Loeger','julie.loeger@ebay.com']]
};
const supportSources={
 Amazon:['','','https://www.amazon.com/hz/contact-us'],
 Target:['','800-440-0680','https://corporate.target.com/about/contact-help'],
 Costco:['','800-955-2292','https://investor.costco.com/resources/investor-contacts/default.aspx'],
 'The Home Depot':['','800-466-3337','https://corporate.homedepot.com/page/contact-us'],
 'Lowe’s':['','800-445-6937','https://corporate.lowes.com/newsroom/contact-media-relations'],
 'CVS Health':['CSS@cvshealth.com','800-746-7287',advocacy+'cvs-health/'],
 Walgreens:['','800-925-4733',advocacy+'walgreens-customer-service-contacts/'],
 'Macy’s':['','','https://www.macys.com/s/contact-us/'],
 Wayfair:['service@wayfair.com','',advocacy+'wayfair-customer-service-contacts/'],
 eBay:['','','https://www.ebay.com/help/home'],
 Apple:['','800-275-2273','https://www.apple.com/contact/'],
 Nordstrom:['Contact@nordstrom.com','888-282-6060',advocacy+'nordstrom/'],
 Kroger:['','800-576-4377','https://www.thekrogerco.com/contact-us/'],
 'Kohl’s':['','855-564-5705','https://corporate.kohls.com/contact-us'],
 'TJX Companies':['customerservice@tjx.com','',advocacy+'tjx-companies/'],
 'ALDI US':['','','https://help.aldi.us/s/contact-form-other'],
 Sephora:['','877-737-4672',advocacy+'sephora-customer-service-contacts/'],
 'Whole Foods Market':['Customer.questions@wholefoods.com','844-936-8255',advocacy+'whole-foods/'],
 Wegmans:['comments@wegmans.com','800-934-6267',advocacy+'wegmans-food-markets/'],
 'Sprouts Farmers Market':['customerrelations@sprouts.com','888-577-7688',advocacy+'sprouts-farmers-market-customer-service-contacts/'],
 'Harbor Freight':['cs@harborfreight.com','800-444-3353',advocacy+'harbor-freight/'],
 'O’Reilly Auto Parts':['','888-327-7153','https://corporate.oreillyauto.com/contact-us/'],
 'Williams-Sonoma':['','800-840-2591','https://www.williams-sonomainc.com/contact-us/']
};
for(const company of companies){
 const [name,,,,,old]=company;
 const entry=escalationSources[name];
 const routes=[];
 if(entry){
  const [slug,office,escalation,...people]=entry,url=advocacy+slug+'/';
  if(office)routes.push(['Executive customer service',office,'',url,'Reported by Elliott Report']);
  if(escalation)routes.push(['Customer escalation',escalation,'',url,'Reported by Elliott Report']);
  for(const [person,email] of people)routes.push(['Direct executive email',email,'',url,person+' · Reported by Elliott Report']);
 }
 if(name==='Urban Outfitters / URBN'){
  for(const [,email,phone,url,person] of old.filter(c=>c[0]==='Executive business contact')){
   routes.push(['Direct executive email',email,phone,url,person+' · Company-published business email']);
  }
 }
 const support=supportSources[name];
 if(support)routes.push(['Customer service',...support]);
 else routes.push(...old.filter(c=>c[0]==='Customer service'));
 if(!routes.length){
  for(const [,email,phone,url] of old.filter(c=>c[0]==='Corporate office')){
   routes.push(['Corporate switchboard','',phone,url,'Ask to be routed to customer relations']);
  }
 }
 company[5]=routes;
}
