from srjvkk.tests import *

class TestPsychosocialController(TestController):

    def test_index(self):
        response = self.app.get(url_for(controller='psychosocial'))
        # Test response...
