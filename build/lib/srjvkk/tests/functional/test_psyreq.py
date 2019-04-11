from srjvkk.tests import *

class TestPsyreqController(TestController):

    def test_index(self):
        response = self.app.get(url_for(controller='psyreq'))
        # Test response...
