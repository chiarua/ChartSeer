import MainProcessor
from MainProcessor import FileUploadProcessor
import unittest
import utils
import json

spec = utils.parse_specs()


class TestFix(unittest.TestCase):
    def test_cases(self):
