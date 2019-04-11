from srjvkk.tests import *

class TestPsycoController(TestController):

    def test_index(self):
        response = self.app.get(url_for(controller='psyco'))
        # Test response...
