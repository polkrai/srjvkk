from srjvkk.tests import *

class TestFinanceController(TestController):

    def test_index(self):
        response = self.app.get(url_for(controller='finance'))
        # Test response...
