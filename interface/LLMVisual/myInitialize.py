from TextGenerator import TextGenerator


class Initialize:
    def __init__(self):
        self.field_descr = None
        self.questions = None
        self.dataset_descr = None
        self.dataset_name = None
        self.chart_set = dict()
        self.textgen = TextGenerator()

    def initialize(self, path) -> None:
        preview: dict = self.textgen.dataset_preview(path)
        self.dataset_name: str = preview['name']
        self.dataset_descr: str = preview['dataset_description']
        self.field_descr: dict = preview['field_description']
        self.questions: list = preview['questions']

    def generate_chart(self, question: str):

