from django.test import TestCase

# Create your tests here.
# userProfile/tests.py
from django.test import TestCase
from django.apps import apps

class PrintDBTablesTest(TestCase):
    def test_print_tables(self):
        for model in apps.get_models():
            print(model._meta.db_table)
