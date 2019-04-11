from srjvkk.tests import *

class TestFinancereportController(TestController):

    def test_index(self):
        response = self.app.get(url_for(controller='financereport'))
        # Test response...
