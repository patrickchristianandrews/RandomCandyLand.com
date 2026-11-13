import csv
import re
from difflib import SequenceMatcher

FIELDS = ('name', 'address', 'city', 'state', 'zip', 'phone', 'email', 'source', 'record_id', 'record_date')

def normalize(value):
    return re.sub(r'[^a-z0-9]+', ' ', str(value or '').casefold()).strip()

def phone(value):
    digits = re.sub(r'\D', '', str(value or ''))
    return digits[1:] if len(digits) == 11 and digits.startswith('1') else digits

def compare(a, b):
    reasons, conflicts = [], []
    na, nb = normalize(a.get('name')), normalize(b.get('name'))
    names = bool(na and nb and (na == nb or SequenceMatcher(None, na, nb).ratio() >= .85))
    if names: reasons.append('Compatible names; similarity is not identity verification')
    elif na and nb: conflicts.append('Names differ')
    ea, eb = (str(r.get('email', '')).strip().casefold() for r in (a, b))
    pa, pb = (phone(r.get('phone')) for r in (a, b))
    email_match = bool(ea and ea == eb)
    phone_match = bool(len(pa) == 10 and pa == pb)
    address_match = bool(normalize(a.get('address')) and all(normalize(a.get(k)) == normalize(b.get(k)) for k in ('address', 'city', 'state', 'zip')))
    duplicate = bool(a.get('source') and a.get('source') == b.get('source') and a.get('record_id') and a.get('record_id') == b.get('record_id'))
    if email_match: reasons.append('Same email; potentially shared or historical')
    if phone_match: reasons.append('Same phone; potentially shared or reassigned')
    if address_match: reasons.append('Same address; does not establish residence or identity')
    if duplicate: reasons.append('Same source identifier; not independent corroboration')
    if a.get('state') and b.get('state') and normalize(a['state']) != normalize(b['state']): conflicts.append('States differ; review dates and possible moves')
    candidate = duplicate or (names and (email_match or phone_match or address_match))
    return {'candidate': candidate, 'status': 'Duplicate source record' if duplicate else 'Possible match: review required' if candidate else 'Insufficient evidence', 'reasons': reasons, 'conflicts': conflicts, 'method': 'Uncalibrated heuristic; no automatic merge'}

def read_records(path):
    with open(path, newline='', encoding='utf-8-sig') as stream:
        reader = csv.DictReader(stream)
        if not reader.fieldnames or 'name' not in reader.fieldnames: raise ValueError('CSV requires a lowercase name column. Use template.csv.')
        records = []
        for i, row in enumerate(reader):
            if i >= 10000: raise ValueError('Maximum 10,000 input rows per import.')
            clean = {str(k): str(v or '') for k, v in row.items() if k is not None}
            if clean.get('name', '').strip(): records.append(clean)
        return records
