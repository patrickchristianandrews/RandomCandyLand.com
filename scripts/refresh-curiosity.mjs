/* Publish a source-linked, freely accessible learning digest and real time-series catalog.
 * Runs at site build / twice daily on GitHub Actions. No secrets required.
 * Failure to reach an upstream source must not turn invented figures into a "fact".
 */
import fs from 'node:fs';
import path from 'node:path';

const root=path.resolve('public/curiosity'),dest=path.join(root,'live-data.json');
const countries={USA:'United States',CAN:'Canada',GBR:'United Kingdom',AUS:'Australia',DEU:'Germany',FRA:'France',JPN:'Japan',BRA:'Brazil'};
const indicators=[
 ['SP.POP.TOTL','Total population','people','People'],
 ['NY.GDP.PCAP.CD','GDP per capita (current US$)','US$','Economy'],
 ['NY.GDP.MKTP.CD','Total GDP (current US$)','US$','Economy'],
 ['SP.DYN.LE00.IN','Life expectancy at birth','years','Health'],
 ['IT.NET.USER.ZS','Individuals using the Internet','% of people','Technology'],
 ['SP.URB.TOTL.IN.ZS','Urban population','% of population','Society'],
 ['SL.UEM.TOTL.ZS','Unemployment rate','% of labor force','Economy'],
 ['SP.DYN.TFRT.IN','Fertility rate','births per woman','People'],
 ['SH.XPD.CHEX.PC.CD','Health spending per person','US$','Health'],
 ['EN.ATM.CO2E.PC','CO₂ emissions per person','metric tons','Environment'],
 ['NV.AGR.TOTL.ZS','Agriculture share of GDP','% of GDP','Economy'],
 ['SE.TER.ENRR','Tertiary school enrollment','% gross','Education'],
 ['NE.EXP.GNFS.ZS','Exports of goods and services','% of GDP','Economy'],
 ['SE.PRM.ENRR','Primary school enrollment','% gross','Education'],
 ['SP.POP.65UP.TO.ZS','Population age 65+','% of population','People'],
 ['EG.ELC.RNEW.ZS','Renewable electricity output','% of total','Environment'],
['SP.RUR.TOTL.ZS','Rural population share','% of population','People'],
 ['SP.POP.0014.TO.ZS','Population ages 0–14','% of population','People'],
 ['SP.POP.1564.TO.ZS','Population ages 15–64','% of population','People'],
 ['SP.DYN.CBRT.IN','Birth rate','births per 1,000','People'],
 ['SP.DYN.CDRT.IN','Death rate','deaths per 1,000','People'],
 ['SP.DYN.IMRT.IN','Infant mortality','per 1,000 live births','Health'],
 ['SP.DYN.LE00.MA.IN','Male life expectancy','years','Health'],
 ['SP.DYN.LE00.FE.IN','Female life expectancy','years','Health'],
 ['SH.XPD.CHEX.GD.ZS','Health spending share of GDP','% of GDP','Health'],
 ['SH.MED.BEDS.ZS','Hospital beds','per 1,000 people','Health'],
 ['SH.IMM.MEAS','Measles immunization','% of children','Health'],
 ['SH.IMM.IDPT','DPT immunization','% of children','Health'],
 ['SL.TLF.TOTL.IN','Total labor force','people','Jobs'],
 ['SL.TLF.CACT.ZS','Labor force participation','% of ages 15+','Jobs'],
 ['SL.TLF.CACT.FE.ZS','Female labor force participation','% of women 15+','Jobs'],
 ['SL.UEM.TOTL.FE.ZS','Female unemployment rate','% of female labor force','Jobs'],
 ['SL.UEM.TOTL.MA.ZS','Male unemployment rate','% of male labor force','Jobs'],
 ['SL.EMP.TOTL.SP.ZS','Employment to population ratio','% ages 15+','Jobs'],
 ['NY.GDP.MKTP.KD.ZG','Annual GDP growth','%','Economy'],
 ['NY.GDP.PCAP.KD.ZG','Annual GDP growth per person','%','Economy'],
 ['FP.CPI.TOTL.ZG','Consumer price inflation','%','Economy'],
 ['NE.CON.PRVT.ZS','Household consumption share of GDP','% of GDP','Economy'],
 ['NE.GDI.TOTL.ZS','Gross capital formation','% of GDP','Economy'],
 ['NE.IMP.GNFS.ZS','Imports of goods and services','% of GDP','Economy'],
 ['NV.IND.TOTL.ZS','Industry share of GDP','% of GDP','Economy'],
 ['NV.SRV.TOTL.ZS','Services share of GDP','% of GDP','Economy'],
 ['GC.TAX.TOTL.GD.ZS','Tax revenue share of GDP','% of GDP','Economy'],
 ['BN.CAB.XOKA.GD.ZS','Current account balance','% of GDP','Economy'],
 ['IT.CEL.SETS.P2','Mobile cellular subscriptions','per 100 people','Technology'],
 ['IT.NET.BBND.P2','Fixed broadband subscriptions','per 100 people','Technology'],
 ['IT.NET.SECR.P6','Secure internet servers','per million people','Technology'],
 ['EG.USE.PCAP.KG.OE','Energy use per person','kg oil equivalent','Energy'],
 ['EG.ELC.ACCS.ZS','Access to electricity','% of population','Energy'],
 ['EG.ELC.FOSL.ZS','Fossil-fuel electricity output','% of electricity','Energy'],
 ['EG.ELC.HYRO.ZS','Hydroelectric electricity output','% of electricity','Energy'],
 ['EG.ELC.NUCL.ZS','Nuclear electricity output','% of electricity','Energy'],
 ['EN.ATM.GHGT.KT.CE','Greenhouse gas emissions','kt CO₂-equivalent','Environment'],
 ['EN.ATM.CO2E.KT','CO₂ emissions','kilotons','Environment'],
 ['AG.LND.FRST.ZS','Forest area','% of land area','Environment'],
 ['AG.LND.AGRI.ZS','Agricultural land','% of land area','Environment'],
 ['AG.LND.ARBL.ZS','Arable land','% of land area','Environment'],
 ['ER.H2O.FWTL.ZS','Freshwater withdrawals','% of internal resources','Environment'],
 ['SE.SEC.ENRR','Secondary school enrollment','% gross','Education'],
 ['SE.PRM.CMPT.ZS','Primary completion rate','% of relevant age group','Education'],
 ['SE.XPD.TOTL.GD.ZS','Government education spending','% of GDP','Education'],
 ['SE.ADT.LITR.ZS','Adult literacy rate','% ages 15+','Education'],
 ['IS.AIR.PSGR','Air transport passengers','passengers','Transport'],
 ['IS.RRS.TOTL.KM','Rail line length','kilometers','Transport'],
 ['IS.VEH.NVEH.P3','Motor vehicles','per 1,000 people','Transport'],
 ['ST.INT.ARVL','International tourist arrivals','people','Tourism'],
 ['ST.INT.RCPT.CD','International tourism receipts','US dollars','Tourism'],
 ['BX.KLT.DINV.WD.GD.ZS','Foreign direct investment inflows','% of GDP','Economy'],
 ['SP.URB.GROW','Urban population growth','% annual','People']
];
let prior={};try{prior=JSON.parse(fs.readFileSync(dest,'utf8'))}catch{}
const fresh={version:1,updatedAt:null,source:'World Bank World Development Indicators',sourceUrl:'https://data.worldbank.org/',countries,indicators:indicators.map(([id,name,unit,group])=>({id,name,unit,group})),series:{},research:[],researchUpdatedAt:null,refreshNote:'No upstream data was fetched in this build.'};
const now=new Date();
async function fetchJson(url,seconds=9){
 const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),seconds*1000);
 try{const r=await fetch(url,{signal:controller.signal,headers:{accept:'application/json','user-agent':'RandomCandyLand/curiosity-public-data (https://randomcandyland.com/curiosity/)'}});
  if(!r.ok)throw Error(r.status+' '+r.statusText);return await r.json();
 }finally{clearTimeout(timer)}
}
async function fetchSeries(country,ind){
 const code=ind[0],u='https://api.worldbank.org/v2/country/'+country+'/indicator/'+code+'?format=json&per_page=120&date=2000:'+new Date().getUTCFullYear();
 const data=await fetchJson(u,11);
 const rows=Array.isArray(data)&&Array.isArray(data[1])?data[1]:[];
 const values=rows.filter(r=>/^(20\d{2})$/.test(String(r.date))&&typeof r.value==='number'&&Number.isFinite(r.value))
   .map(r=>({year:Number(r.date),value:Number(r.value)})).sort((a,b)=>a.year-b.year);
 return values.length>=8?values:null;
}
async function main(){
 let taken=0,failed=0;
 // Run a small number in parallel to avoid abusive traffic against a free public API.
 const tasks=Object.keys(countries).flatMap(country=>indicators.map(ind=>({country,ind})));
 let pointer=0;
 async function work(){
  while(pointer<tasks.length){
   const {country,ind}=tasks[pointer++],key=country+'|'+ind[0];
   try{const data=await fetchSeries(country,ind);
    if(data){fresh.series[key]=data;taken++}
    else if(Array.isArray(prior.series?.[key])&&prior.series[key].length>=8)fresh.series[key]=prior.series[key];
   }catch(error){failed++;
    if(Array.isArray(prior.series?.[key])&&prior.series[key].length>=8)fresh.series[key]=prior.series[key];
   }
  }
 }
 await Promise.all(Array.from({length:12},()=>work()));
 if(taken>0)fresh.updatedAt=now.toISOString();
 else if(Object.keys(fresh.series).length)fresh.updatedAt=prior.updatedAt||null;

 // OpenAlex: public index metadata only. It is NOT peer review or quality validation.
 // Keyless requests are allowed for modest demos but can be throttled by upstream.
 const minDate=new Date(Date.now()-95*86400000).toISOString().slice(0,10);
 const queries=['psychology of decision making','cognitive bias','behavioral science'];
 const papers=[];
 for(const query of queries){
  if(papers.length>=9)break;
  const u='https://api.openalex.org/works?search='+encodeURIComponent(query)+'&filter=from_publication_date:'+minDate+
   ',has_doi:true&sort=publication_date:desc&per_page=10&select=title,publication_date,primary_location,doi,id';
  try{
   const result=await fetchJson(u,8);
   for(const work of Array.isArray(result.results)?result.results:[]){
    const title=String(work.title||'').trim(),published=String(work.publication_date||''),
      doi=String(work.doi||''),loc=String(work.primary_location?.source?.display_name||'Research index');
    const url=doi.startsWith('https://doi.org/');if(title.length<14||title.length>220||/\b(?:LLM|OpenAI|ChatGPT|Claude|Gemini|GPT-[0-9]|artificial[ -]+intelligence)\b/i.test(title+' '+loc)||!url||!/^\d{4}-\d{2}-\d{2}$/.test(published)||papers.some(x=>x.url===doi))continue;
    papers.push({title,published,source:loc.slice(0,110),url:doi});if(papers.length>=9)break;
   }
  }catch(error){console.warn('OpenAlex metadata temporarily unavailable:',String(error?.message||error))}
 }
 if(papers.length){fresh.research=papers;fresh.researchUpdatedAt=now.toISOString();}
 else if(Array.isArray(prior.research)&&prior.research.length){fresh.research=prior.research;fresh.researchUpdatedAt=prior.researchUpdatedAt||null}
 fresh.refreshNote=taken+' indicator time series refreshed, '+failed+' source requests failed or timed out; '+papers.length+' current research titles found. Missing records never receive fabricated values.';
 fs.mkdirSync(root,{recursive:true});fs.writeFileSync(dest,JSON.stringify(fresh));
 console.log('Wonder Index update: '+fresh.refreshNote+' Total accessible series: '+Object.keys(fresh.series).length);
 if(Object.keys(fresh.series).length===0)console.warn('No World Bank series available; correlation UI will explain that live data is unavailable.');
}
await main();
