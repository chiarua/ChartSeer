from . import TextGenerator

class Initialize:
    def __init__(self):
        self.persona = None
        self.field_descr = None
        self.questions = None
        self.dataset_descr = None
        self.dataset_name = None
        self.chart_set = dict()
        self.textgen = TextGenerator.TextGenerator()

    def initialize(self, path) -> None:
        preview: dict = self.textgen.dataset_preview(path)['preview']
        print(preview)
        self.dataset_name: str = preview['name']
        self.dataset_descr: str = preview['dataset_description']
        self.field_descr: dict = preview['field_description']
        self.questions: list = preview['questions']
        self.persona = self.textgen.load_prompts(query="VEGALITE_PROMPT")

    def generate(self, question: str):
        persona = self.persona
        # Todo: add sample charts? if we should?
        instruction = 'name: ' + self.dataset_name + '; dataset_description: ' + self.dataset_descr \
                      + '; field_description: ' + str(self.field_descr) + '; the question: ' + question
        message = self.textgen.generate(persona, instruction)
        return message['visualization_list']

    def get_persona(self):
        return self.persona



