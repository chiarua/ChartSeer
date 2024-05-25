from typing import List

from .Initial import Initialize
from . import utils
from . import TextGen


class FileUploadProcessor:
    def __init__(self):
        self.field_preview = None
        self.dataset_preview = None
        self.questions = None
        self.charts = []  # contains 'vega-lite_code', 'explanation', 'question'
        self.modify_persona = None

        self.ini = Initialize()

    def uploaded(self, dataset: str):
        self.ini.initialize(dataset)
        self.questions = self.ini.get_questions()
        self.dataset_preview = self.ini.get_dataset_prev()
        self.field_preview = self.ini.get_field_prev()
        self.modify_persona = utils.load_prompts(query="MODIFY_PROMPT")
        self.chart_desc_persona = utils.load_prompts(query="DESCRIPTION_PROMPT")

    def get_questions(self) -> list:
        return self.questions

    def get_preview(self) -> str:
        return self.dataset_preview

    def update_questions(self, q: List[str]):
        self.questions = q

    def add_question(self, q: str):
        self.questions.append(q)

    def generate_charts_ini(self) -> None:
        for q in self.questions:
            self.generate_charts_user(q)

    def generate_charts_user(self, q: str) -> None:
        res = self.ini.generate(q)
        for ch in res:
            ch['question'] = q
            self.charts.append(ch)

    # Todo: each time adding new charts we should render again

    def modify_charts(self, target_chart: dict, user_input) -> dict:
        # Todo: data?
        # 让generator返回"vega-lite_code""explanation" 已完成
        prev_chart = target_chart.get("vega-lite_code")
        prev_question = target_chart.get("question")
        modify_instr = "Here are the Vega_Lite charts that need to be modified:" + prev_chart + "Here are the " \
                                                                                                "user-specified " \
                                                                                                "modification " \
                                                                                                "suggestions:" + \
                       user_input + "Here are the questions corresponding to the original charts:" + prev_question + \
                       "Please generate new charts and descriptions according to the given rules"

        generator = TextGen.TextGenerator()
        gpt_output: dict = generator.generate(self.modify_persona, modify_instr)

        new_chart = gpt_output.get("vega-lite_code")
        new_explanation = gpt_output.get("explanation")
        res_dic = {"vega-lite_code": new_chart, "explanation": new_explanation, "question": prev_question}
        return res_dic

    def generate_chart_description(self, chart: str):
        instr = "Here is the chart:" + chart + "Here is the description of the dataset:" + self.dataset_preview + "and here is the description of the data attributes: " + str(self.field_preview)

        generator = TextGen.TextGenerator()
        gpt_output: dict = generator.generate(self.chart_desc_persona, instr)
        return gpt_output
