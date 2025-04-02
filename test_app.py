
import unittest
from app import app
from prettytable import PrettyTable

class FlaskAppTests(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        """Set up the test client and configure app for testing"""
        app.testing = True
        cls.client = app.test_client()
        cls.results_table = PrettyTable(["Test", "Description", "Result"])

    def test_routes_status_code(self):
        """Test that all routes return a 200 OK response"""
        routes = ['/', '/about', '/creative', '/advanced', '/basic']

        for route in routes:
            response = self.client.get(route)
            try:
                self.assertEqual(response.status_code, 200)
                self.results_table.add_row([f"Route: {route}", "Status Code 200", " PASSED"])
            except AssertionError:
                self.results_table.add_row([f"Route: {route}", "Status Code 200", " FAILED"])
                raise

    def test_homepage_content(self):
        """Test that the homepage contains expected content"""
        response = self.client.get('/')
        try:
            self.assertEqual(response.status_code, 200)
            self.assertIn(b'<title>X Airline Sentiment</title>', response.data) # deliberate error to check if test fails/test works
            self.results_table.add_row(["Homepage Content", "<title> Check", " PASSED"])
        except AssertionError:
            self.results_table.add_row(["Homepage Content", "<title> Check", " FAILED"])
            raise

    def test_404_error(self):
        """Test that a non-existent route returns a 404 Not Found response"""
        response = self.client.get('/nonexistent')
        try:
            self.assertEqual(response.status_code, 404)
            self.results_table.add_row(["Route: /nonexistent", "404 Not Found", " PASSED"])
        except AssertionError:
            self.results_table.add_row(["Route: /nonexistent", "404 Not Found", " FAILED"])
            raise

    @classmethod
    def tearDownClass(cls):
        print("\nTest Result Table:")
        print(cls.results_table)


if __name__ == '__main__':
    unittest.main(verbosity=2)