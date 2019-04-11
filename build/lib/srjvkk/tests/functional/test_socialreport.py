from srjvkk.tests import *

class TestSocialreportController(TestController):

    def test_index(self):
        response = self.app.get(url_for(controller='socialreport'))
        # Test response...
