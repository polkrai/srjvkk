from srjvkk.tests import *

class TestSrutilController(TestController):

    def test_index(self):
        response = self.app.get(url_for(controller='srqueue'))
        # Test response...
