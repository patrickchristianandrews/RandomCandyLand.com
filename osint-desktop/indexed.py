import csv
import hashlib
import json
import os
import queue
import re
import sqlite3
import threading
import time
import urllib.parse
import urllib.request
from datetime import datetime, timezone
from pathlib import Path
import tkinter as tk
from tkinter import ttk, filedialog, messagebox
from app import App
from core import read_records

class Index:
    def __init__(self, path):
        self.db = sqlite3.connect(str(path), timeout=30)
        self.db.execute('PRAGMA journal_mode=WAL')
        self.db.execute('CREATE TABLE IF NOT EXISTS records(id INTEGER PRIMARY KEY, source TEXT NOT NULL, source_id TEXT NOT NULL, data TEXT NOT NULL, UNIQUE(source,source_id))')
        self.db.execute('CREATE VIRTUAL TABLE IF NOT EXISTS records_fts USING fts5(body)')
        self.db.execute('CREATE TABLE IF NOT EXISTS progress(source TEXT PRIMARY KEY, cursor TEXT NOT NULL)')
        self.db.commit()

    def put(self, rows, checkpoint=None):
        with self.db:
            for row in rows:
                source, sid = row.get('source'), row.get('record_id')
                if not source or not sid: raise ValueError('Source and record ID required')
                data = json.dumps(row, sort_keys=True, ensure_ascii=False)
                self.db.execute('INSERT INTO records(source,source_id,data) VALUES(?,?,?) ON CONFLICT(source,source_id) DO UPDATE SET data=excluded.data',(source,str(sid),data))
                rid = self.db.execute('SELECT id FROM records WHERE source=? AND source_id=?',(source,str(sid))).fetchone()[0]
                self.db.execute('DELETE FROM records_fts WHERE rowid=?',(rid,))
                self.db.execute('INSERT INTO records_fts(rowid,body) VALUES(?,?)',(rid,' '.join(str(v) for v in row.values())))
            if checkpoint is not None:
                self.db.execute('INSERT INTO progress(source,cursor) VALUES(?,?) ON CONFLICT(source) DO UPDATE SET cursor=excluded.cursor',('NYC PLUTO',str(checkpoint)))

    def search(self, query='', offset=0):
        words = re.findall(r'[^\W_]+',query,flags=re.UNICODE)[:20]
        args = []
        where = ''
        if words:
            where = ' WHERE id IN (SELECT rowid FROM records_fts WHERE records_fts MATCH ?)'
            args = [' AND '.join('"'+word+'"*' for word in words)]
        count = self.db.execute('SELECT COUNT(*) FROM records'+where,args).fetchone()[0]
        rows = self.db.execute('SELECT data FROM records'+where+' ORDER BY id LIMIT 100 OFFSET ?',args+[max(int(offset),0)]).fetchall()
        return count,[json.loads(row[0]) for row in rows]

    def cursor(self):
        row = self.db.execute('SELECT cursor FROM progress WHERE source=?',('NYC PLUTO',)).fetchone()
        return row[0] if row else '0'

    def close(self): self.db.close()

def download(path, cancel, messages):
    index = Index(path)
    try:
        cursor = index.cursor()
        while not cancel.is_set():
            params = {'$select':':id AS source_row_id,*','$where':':id > '+str(int(cursor)),'$order':':id','$limit':'1000'}
            url = 'https://data.cityofnewyork.us/resource/64uk-42ks.json?'+urllib.parse.urlencode(params)
            page = None
            for attempt in range(4):
                try:
                    request = urllib.request.Request(url,headers={'User-Agent':'CandyLandOSINT/0.2'})
                    with urllib.request.urlopen(request,timeout=45) as response: page = json.load(response)
                    if not isinstance(page,list): raise ValueError('Unexpected source response')
                    break
                except Exception:
                    if attempt == 3: raise
                    if cancel.wait(2**attempt): return
            if not page:
                messages.put(('done','NYC scan complete; not a synchronized snapshot or nationwide coverage.'))
                return
            rows = []
            for raw in page:
                sid = str(raw.get('source_row_id',''))
                if not sid.isdigit(): raise ValueError('Invalid source row identifier')
                rows.append({'source':'NYC PLUTO','record_id':sid,'kind':'property','state':'NY','name':str(raw.get('ownername','')),'address':str(raw.get('address','')),'zip':str(raw.get('zipcode','')),'parcel_id':str(raw.get('bbl','')),'record_date':str(raw.get('version','')),'retrieved_at':datetime.now(timezone.utc).isoformat(),'source_url':'https://data.cityofnewyork.us/City-Government/Primary-Land-Use-Tax-Lot-Output-PLUTO-/64uk-42ks','relationship':'Named property owner in publisher data; not verified residence or current legal title','raw_json':json.dumps(raw,sort_keys=True)})
            cursor = str(max(int(row['record_id']) for row in rows))
            index.put(rows,cursor)
            messages.put(('progress',f'{index.search()[0]} records indexed. NYC-only partial coverage.'))
            cancel.wait(.3)
        messages.put(('done','Paused. Stored records remain searchable. Resume to continue.'))
    except Exception as exc: messages.put(('error','Property ingestion failed: '+str(exc)))
    finally: index.close()

class IndexedApp(App):
    def __init__(self, root):
        directory = Path(os.environ.get('LOCALAPPDATA',str(Path.home()))) / 'CandyLandOSINT'
        directory.mkdir(parents=True,exist_ok=True)
        self.db_path = directory/'indexed-records.sqlite3'
        self.index = Index(self.db_path)
        self.offset = 0
        self.cancel = threading.Event()
        self.messages = queue.Queue()
        self.worker = None
        self.known_total = 0
        self.last_query = None
        super().__init__(root)
        root.title('CandyLand OSINT - indexed development workspace')
        controls = ttk.Frame(root,padding=8)
        controls.pack(fill='x')
        for title,command in (('Download / resume NYC property data',self.download),('Pause download',self.cancel.set),('Previous page',lambda:self.page(-1)),('Next page',lambda:self.page(1)),('Refresh search',self.refresh)):
            ttk.Button(controls,text=title,command=command).pack(side='left',padx=3)
        self.activity = tk.StringVar(value='Persistent search enabled. No dataset is bundled. Only NYC property ingestion is implemented; court and voter sources remain external links.')
        ttk.Label(root,textvariable=self.activity,wraplength=1050).pack(anchor='w',padx=12,pady=6)
        root.protocol('WM_DELETE_WINDOW',self.close)
        self.refresh()
        root.after(250,self.poll)

    def refresh(self):
        query = self.query.get().strip()
        if query != self.last_query: self.offset = 0; self.last_query = query
        self.known_total,self.records = self.index.search(query,self.offset)
        self.tree.delete(*self.tree.get_children())
        for i,row in enumerate(self.records):
            self.tree.insert('','end',iid=str(i),values=tuple(row.get(c,'') for c in self.tree['columns']))
        self.status.set(f'{self.known_total} matching saved records; page {self.offset//100+1}. All-field token/prefix search. Candidate discovery compares this displayed page only. Nothing is automatically merged.')

    def page(self, direction):
        offset = max(0,self.offset+direction*100)
        if offset < self.known_total or offset == 0: self.offset=offset; self.refresh()

    def import_csv(self):
        path = filedialog.askopenfilename(filetypes=[('CSV files','*.csv')])
        if not path:return
        try:
            rows = read_records(path)
            for row in rows:
                row['source'] = row.get('source') or 'User imported: '+Path(path).name
                if not row.get('record_id'):row['record_id']=hashlib.sha256(json.dumps(row,sort_keys=True).encode()).hexdigest()
            self.index.put(rows)
            self.refresh()
        except Exception as exc:messagebox.showerror('Import failed',str(exc))

    def download(self):
        if self.worker and self.worker.is_alive():return
        if not messagebox.askyesno('Download public dataset','Download NYC PLUTO property data? This requires internet, time and disk space. No search terms are sent. Coverage is NYC only. Existing publisher changes and deletions are not yet reconciled.'):return
        self.cancel.clear()
        self.worker = threading.Thread(target=download,args=(self.db_path,self.cancel,self.messages),daemon=True)
        self.worker.start()

    def poll(self):
        while not self.messages.empty():
            kind,text = self.messages.get(); self.activity.set(text)
        if self.worker and not self.worker.is_alive():self.worker=None;self.refresh()
        self.root.after(250,self.poll)

    def close(self):
        self.cancel.set(); self.index.close(); self.root.destroy()

if __name__ == '__main__':
    root=tk.Tk(); IndexedApp(root); root.mainloop()
