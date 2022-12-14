from srjvkk.tests import *

class TestSocialController(TestController):

    def test_index(self):
        response = self.app.get(url_for(controller='social'))
        # Test response...
