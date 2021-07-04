from srjvkk.tests import *

class TestJsController(TestController):

    def test_index(self):
        response = self.app.get(url_for(controller='js'))
        # Test response...
