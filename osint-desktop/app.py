import csv
import json
import threading
import tkinter as tk
from tkinter import ttk, filedialog, messagebox
import urllib.parse
import urllib.request
import webbrowser
from datetime import datetime, timezone
from core import FIELDS, compare, read_records

SOURCES = [
    ('Property: NYC PLUTO / MapPLUTO', 'https://www.nyc.gov/content/planning/pages/resources/datasets/mappluto-pluto-change', 'NYC tax-lot data. Manual download and schema conversion; not nationwide deeds.'),
    ('Courts: CourtListener / RECAP', 'https://www.courtlistener.com/recap/', 'External research only. Not all courts or documents are covered.'),
    ('Registration: North Carolina', 'https://www.ncsbe.gov/results-data/voter-registration-data', 'External official download. Review current access, use and redistribution rules.'),
    ('Geography: Census TIGER/Line', 'https://www.census.gov/geographies/mapping-files/time-series/geo/tiger-line-file.html', 'Geography only; not named residents.'),
    ('Statistics: ACS', 'https://www.census.gov/data/developers/data-sets/acs-5year.html', 'Statistical context; not personal contact records.')
]

class App:
    def __init__(self, root):
        self.root, self.records, self.evidence = root, [], []
        root.title('CandyLand OSINT - U.S. public-record workspace')
        root.geometry('1100x760')
        frame = ttk.Frame(root, padding=16)
        frame.pack(fill='both', expand=True)
        ttk.Label(frame, text='U.S. public-record workspace', font=('Segoe UI', 19)).pack(anchor='w')
        ttk.Label(frame, text='Initial local workspace | No bundled personal database | No automatic identity merges').pack(anchor='w', pady=8)
        tabs = ttk.Notebook(frame)
        tabs.pack(fill='both', expand=True)
        records, sources, geography = (ttk.Frame(tabs, padding=10) for _ in range(3))
        for widget, title in ((records, 'Records'), (sources, 'Sources & coverage'), (geography, 'Address geography')): tabs.add(widget, text=title)
        toolbar = ttk.Frame(records)
        toolbar.pack(fill='x')
        for title, command in (('Import CSV', self.import_csv), ('Save template', self.template), ('Compare two', self.compare_selected), ('Find candidates', self.candidates), ('Export evidence', self.export)):
            ttk.Button(toolbar, text=title, command=command).pack(side='left', padx=3)
        self.query = tk.StringVar()
        ttk.Entry(records, textvariable=self.query).pack(fill='x', pady=8)
        self.query.trace_add('write', lambda *_: self.refresh())
        ttk.Label(records, text='Filter imported records. Ctrl+click to select two records. Source files may require schema conversion.').pack(anchor='w')
        columns = ('name', 'address', 'source', 'record_date')
        self.tree = ttk.Treeview(records, columns=columns, show='headings', height=11, selectmode='extended')
        for col in columns:
            self.tree.heading(col, text=col.replace('_', ' ').title())
            self.tree.column(col, width=220)
        self.tree.pack(fill='both', expand=True, pady=8)
        self.tree.bind('<<TreeviewSelect>>', self.inspect)
        self.output = tk.Text(records, height=12, wrap='word')
        self.output.pack(fill='both', expand=True)
        self.status = tk.StringVar(value='Records are kept in memory only. Export comparisons before closing. No telemetry implemented.')
        ttk.Label(frame, textvariable=self.status, wraplength=1000).pack(anchor='w', pady=8)
        for title, url, note in SOURCES:
            group = ttk.LabelFrame(sources, text=title, padding=10)
            group.pack(fill='x', pady=5)
            ttk.Label(group, text=note, wraplength=900).pack(anchor='w')
            ttk.Button(group, text='Open official source', command=lambda u=url: webbrowser.open(u)).pack(anchor='w', pady=5)
        ttk.Label(sources, text='Manual/external links, not live integrations. Use lawfully obtained data only. No paid, voter, court, dark-web or breach-data automation is enabled.', wraplength=900).pack(anchor='w', pady=8)
        ttk.Label(geography, text='Census geography lookup: not postal verification and not proof of identity or residence.', wraplength=900).pack(anchor='w')
        self.address = tk.StringVar()
        ttk.Entry(geography, textvariable=self.address).pack(fill='x', pady=10)
        self.geo_button = ttk.Button(geography, text='Send address to Census (confirmation required)', command=self.geocode)
        self.geo_button.pack(anchor='w')
        self.geo_output = tk.Text(geography, wrap='word')
        self.geo_output.pack(fill='both', expand=True, pady=10)

    def show(self, value):
        self.output.delete('1.0', 'end')
        self.output.insert('end', json.dumps(value, indent=2, ensure_ascii=False))

    def refresh(self):
        self.tree.delete(*self.tree.get_children())
        query = self.query.get().strip().casefold()
        for i, row in enumerate(self.records):
            if not query or query in ' '.join(row.values()).casefold():
                self.tree.insert('', 'end', iid=str(i), values=tuple(row.get(c, '') for c in self.tree['columns']))
        self.status.set(f'{len(self.records)} records in memory; {len(self.tree.get_children())} visible. No automatic merges.')

    def inspect(self, event=None):
        selected = self.tree.selection()
        if len(selected) == 1: self.show(self.records[int(selected[0])])

    def import_csv(self):
        path = filedialog.askopenfilename(filetypes=[('CSV files', '*.csv')])
        if not path: return
        try:
            rows = read_records(path)
            if len(rows) + len(self.records) > 10000: raise ValueError('Workspace limit: 10,000 records.')
            self.records.extend(rows)
            self.refresh()
        except Exception as exc: messagebox.showerror('Import failed', str(exc))

    def template(self):
        path = filedialog.asksaveasfilename(defaultextension='.csv', filetypes=[('CSV files', '*.csv')])
        if not path: return
        try:
            with open(path, 'w', newline='', encoding='utf-8') as stream: csv.writer(stream).writerow(FIELDS)
        except OSError as exc: messagebox.showerror('Save failed', str(exc))

    def compare_selected(self):
        selected = self.tree.selection()
        if len(selected) != 2:
            messagebox.showinfo('Select two records', 'Use Ctrl+click to select exactly two records.')
            return
        left, right = (self.records[int(i)] for i in selected)
        evidence = {'compared_at': datetime.now(timezone.utc).isoformat(), 'left': left, 'right': right, 'comparison': compare(left, right)}
        self.evidence.append(evidence)
        self.show(evidence)

    def candidates(self):
        selected = self.tree.selection()
        if len(selected) != 1:
            messagebox.showinfo('Select one record', 'Select one record to compare with the local workspace.')
            return
        index = int(selected[0])
        found = []
        for i, row in enumerate(self.records):
            if i == index: continue
            result = compare(self.records[index], row)
            if result['candidate']: found.append({'row': i + 1, 'record': row, 'comparison': result})
        self.show({'record': self.records[index], 'candidates': found, 'notice': 'No automatic merges. Compare a pair explicitly to include it in the evidence export.'})

    def export(self):
        if not self.evidence:
            messagebox.showinfo('No evidence yet', 'Compare two records before exporting.')
            return
        if not messagebox.askyesno('Sensitive export', 'Save original records and comparisons as an unencrypted JSON file?'): return
        path = filedialog.asksaveasfilename(defaultextension='.json', filetypes=[('JSON files', '*.json')])
        if not path: return
        try:
            with open(path, 'w', encoding='utf-8') as stream: json.dump(self.evidence, stream, indent=2, ensure_ascii=False)
            self.status.set('Evidence saved. Protect the unencrypted export.')
        except OSError as exc: messagebox.showerror('Export failed', str(exc))

    def geocode(self):
        address = self.address.get().strip()
        if not address: return
        if not messagebox.askyesno('External request', 'Send this address to the U.S. Census Bureau?\n\n' + address): return
        self.geo_button.configure(state='disabled')
        self.geo_output.delete('1.0', 'end')
        self.geo_output.insert('end', 'Loading...')
        def finish(text):
            self.geo_output.delete('1.0', 'end')
            self.geo_output.insert('end', text)
            self.geo_button.configure(state='normal')
        def work():
            try:
                query = urllib.parse.urlencode({'address': address, 'benchmark': 'Public_AR_Current', 'vintage': 'Current_Current', 'format': 'json'})
                url = 'https://geocoding.geo.census.gov/geocoder/geographies/onelineaddress?' + query
                request = urllib.request.Request(url, headers={'User-Agent': 'CandyLandPublicRecords/0.1'})
                with urllib.request.urlopen(request, timeout=30) as response: data = json.load(response)
                text = json.dumps({'source': url, 'retrieved_at': datetime.now(timezone.utc).isoformat(), 'warning': 'Geographic match only; does not identify residents or establish postal deliverability.', 'result': data}, indent=2)
            except Exception as exc: text = 'Lookup failed: ' + str(exc)
            self.root.after(0, lambda: finish(text))
        threading.Thread(target=work, daemon=True).start()

if __name__ == '__main__':
    root = tk.Tk()
    App(root)
    root.mainloop()
