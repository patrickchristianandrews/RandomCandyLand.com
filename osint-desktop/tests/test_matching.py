import unittest
from core import compare, normalize

class MatchingTests(unittest.TestCase):
    def test_name_only(self):
        self.assertFalse(compare({'name':'John Smith'}, {'name':'John Smith'})['candidate'])
    def test_shared_phone(self):
        self.assertFalse(compare({'name':'Mary Jones','phone':'2125550100'}, {'name':'Alan Brown','phone':'2125550100'})['candidate'])
    def test_formatted_phone(self):
        self.assertTrue(compare({'name':'Jane Doe','phone':'+1 (212) 555-0100'}, {'name':'Jane Doe','phone':'2125550100'})['candidate'])
    def test_units(self):
        self.assertFalse(compare({'name':'Jane Doe','address':'1 Main Apt 1'}, {'name':'Jane Doe','address':'1 Main Apt 2'})['candidate'])
    def test_duplicate(self):
        self.assertEqual(compare({'source':'County A','record_id':'123'}, {'source':'County A','record_id':'123'})['status'], 'Duplicate source record')
    def test_different_sources(self):
        self.assertFalse(compare({'source':'County A','record_id':'123'}, {'source':'County B','record_id':'123'})['candidate'])
    def test_normalize(self):
        self.assertEqual(normalize(' Jane  DOE! '), 'jane doe')

if __name__ == '__main__': unittest.main()
