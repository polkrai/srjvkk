from srjvkk.tests import *

class TestPsycoreportController(TestController):

    def test_index(self):
        response = self.app.get(url_for(controller='psycoreport'))
        # Test response...
