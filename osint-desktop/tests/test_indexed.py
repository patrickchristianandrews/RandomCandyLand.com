import tempfile
import unittest
from pathlib import Path
from indexed import Index

class IndexTests(unittest.TestCase):
    def setUp(self):
        self.temp=tempfile.TemporaryDirectory();self.path=Path(self.temp.name)/'test.db';self.index=Index(self.path)
        self.index.put([{'source':'Test','record_id':'1','name':'Jane Example','address':'10 Sample Street','phone':'212-555-0100','parcel_id':'ABC123'},{'source':'Test','record_id':'2','name':'Alan Sample'}])
    def tearDown(self):self.index.close();self.temp.cleanup()
    def test_persistence(self):
        self.index.close();self.index=Index(self.path);self.assertEqual(self.index.search()[0],2)
    def test_prefix_terms(self):self.assertEqual(self.index.search('jan samp')[0],1)
    def test_identifier(self):self.assertEqual(self.index.search('ABC123')[0],1)
    def test_phone(self):self.assertEqual(self.index.search('212-555-0100')[0],1)
    def test_update(self):
        self.index.put([{'source':'Test','record_id':'1','name':'Renamed'}]);self.assertEqual(self.index.search('Jane')[0],0);self.assertEqual(self.index.search('Renamed')[0],1)
    def test_source_namespaces(self):
        self.index.put([{'source':'Other','record_id':'1','name':'Other'}]);self.assertEqual(self.index.search()[0],3)
    def test_query_safety(self):self.assertEqual(self.index.search('xyz OR 1=1')[0],0)
    def test_transaction(self):
        with self.assertRaises(ValueError):self.index.put([{'source':'Test','record_id':'3','name':'Temporary'},{'name':'Invalid'}])
        self.assertEqual(self.index.search()[0],2)
    def test_checkpoint(self):
        self.index.put([],checkpoint='20');self.assertEqual(self.index.cursor(),'20')

if __name__=='__main__':unittest.main()
