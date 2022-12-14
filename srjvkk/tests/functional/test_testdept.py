from srjvkk.tests import *

class TestTestdeptController(TestController):

    def test_index(self):
        response = self.app.get(url_for(controller='testdept'))
        # Test response...
