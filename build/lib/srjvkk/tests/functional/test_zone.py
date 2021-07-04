from srjvkk.tests import *

class TestZoneController(TestController):

    def test_index(self):
        response = self.app.get(url_for(controller='zone'))
        # Test response...
