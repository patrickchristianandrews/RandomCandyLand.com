from concurrent.futures import ThreadPoolExecutor
from datetime import datetime,timezone
from urllib.request import urlopen
from urllib.parse import urlparse
import json,sys
from pathlib import Path
def collect(district):
 url=f'https://cwwp2.dot.ca.gov/data/d{district}/cctv/cctvStatusD{district:02}.json'
 try:
  with urlopen(url,timeout=14) as f:data=json.load(f)
 except Exception as e:return district,[],str(e)
 result=[]
 for row in data['data']:
  c=row['cctv'];loc=c['location']
  if c.get('inService')!='true':continue
  try:lat,lon=float(loc['latitude']),float(loc['longitude'])
  except (TypeError,ValueError):continue
  if not (30<lat<44 and -125<lon<-112):continue
  img=c.get('imageData',{}).get('static',{}).get('currentImageURL','')
  u=urlparse(img)
  if u.scheme!='https' or u.hostname!='cwwp2.dot.ca.gov':img=''
  place=loc.get('nearbyPlace','')
  result.append([loc.get('locationName') or loc.get('route'),place or loc.get('county',''),loc.get('route',''),lat,lon,img])
 return district,result,''
with ThreadPoolExecutor(max_workers=12) as pool: groups=list(pool.map(collect,range(1,13)))
seen={}
for district,rows,error in groups:
 print(district,len(rows),error,flush=True)
 for row in rows:seen.setdefault((row[0],row[3],row[4]),row)
assert len(seen)>100
rows=sorted(seen.values(),key=lambda row:(row[1],row[0]))
out='const CAMERA_DATE = '+json.dumps(datetime.now(timezone.utc).date().isoformat())+';\nconst CAMERAS = '+json.dumps(rows,ensure_ascii=False,separators=(',',':'))+';\n'
Path(sys.argv[1]).write_text(out)
print('Total',len(rows),len(out))
