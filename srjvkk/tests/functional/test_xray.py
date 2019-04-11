from srjvkk.tests import *

class TestXrayController(TestController):

    def test_index(self):
        response = self.app.get(url_for(controller='xray'))
        # Test response...
