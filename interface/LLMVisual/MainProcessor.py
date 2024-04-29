from typing import List

from .Initial import Initialize

class FileUploadProcessor:
    def __init__(self):
        self.dataset_preview = None
        self.questions = None
        self.charts = [] # contains 'vega-lite_code', 'explanation', 'question'

        self.ini = Initialize()
        
    def uploaded(self,  dataset:str):
        self.ini.initialize(dataset)
        self.questions = self.ini.get_questions()
        self.dataset_preview = self.ini.get_dataset_prev()

    def get_questions(self)->list:
        return self.questions

    def get_preview(self)->str:
        return self.dataset_preview

    def update_questions(self, q: List[str]):
        self.questions = q

    def add_question(self, q:str):
        self.questions.append(q)

    def generate_charts_ini(self)->None:
        for q in self.questions:
            self.generate_charts_user(q)

    def generate_charts_user(self, q:str)->None:
        res = self.ini.generate(q)
        for ch in res:
            ch['question'] = q
            self.charts.append(ch)

    # Todo: each time adding new charts we should render again