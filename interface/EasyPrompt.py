from LLMVisual import TextGen
from LLMVisual import Initial
from LLMVisual import MainProcessor
import json
import pandas as pd

"""目前正使用三部分提示词： 
生成数据集总结和问题时的persona： You are an experienced data analyst that can annotate datasets. Your 
    instructions are as follows: i) ALWAYS generate the name of the dataset and the dataset_description ii) ALWAYS 
    generate a field description. iii.) ALWAYS generate THREE questions You must return an updated JSON dictionary 
    without any preamble or explanation." 
    
生成数据集总结和问题时的instruction："接下来你将读到目标数据集的前7列，为json格式，请根据目标数据集的数据属性总结其内容，你的输出应当为json格式，其中 
    只有一个名为‘preview’的键，其值为你的总结内容，键分别是name、dataset_description、field_description、questions。目标数据集如下：" 
    
根据问题生成图表时候的persona（需要更改）： 
    "用户想要对一个数据进行可视化分析，用户会输入他的意图，想要怎么样的可视化，然后用户接下来的输入有两个，第一个是json格式的vega-lite语法表示的可视化图表，这个图表只有设计属性，数据属性field用num或str
    表示；第二个输入是对目标数据集的整体描述和对每种数据属性的描述。请根据数据集补充可视化图表的数据属性，生成补充完数据属性的完整的可视化图表，你必须保证field的值不为sum或者str
    而是有效的数据属性。你必须在保证生成的可视化图表符合用户探索意图的情况下，尽可能多地生成可视化！\nvega-lite图表生成最终结果样例：\n{\n            \"encoding\": {\n              
      \"y\": {\n                    \"field\": \"Miles_per_Gallon\",\n                    \"type\": \"quantitative\"\n    
                  },\n                \"x\": {\n                    \"field\": \"Year\",\n                    \"type\": 
                  \"temporal\",\n                    \"timeUnit\": \"year\"\n                }\n            },\n          
                    \"mark\": \"point\"\n        
                    }\n你的输出将使用json格式输出，必须有一个可视化解释和vega-lite可视化代码。你的输出必须有且只有一个json格式字符串！\nJson包括一个列表(key is 
                    visualization_list)，该列表包括多个字典，每个字典有且只有两个键：“explanation”,
                    ”vega-lite_code“，你只需生成合法的vega-lite语法的mark、encoding字段作为”vega-lite_code“的值，不需要填充data字段"
                    
此时的instruction包括：数据集名字、整体概述、对每个属性的描述、问题
请更改persona
"""


class EasyEditing:
    def __init__(self):
        self.dataset_path = "staticdata/cars_clear.json"
        self.text_gen = TextGen.TextGenerator()
        self.persona_for_question = self.text_gen.persona
        self.instr_for_question = self.text_gen.instruction
        self.persona_for_vegalite = ""

    def inputForQuiz(self):
        """
        第一步是生成数据集总结
        :return: TextGen.TextGenerator()
        """
        input_path = input("填写数据集的(根)路径，跳过请输入‘j’：")
        if input_path != 'j':
            self.dataset_path = input_path
        input_persona = input("填写生成数据集时的persona，跳过请输入‘j’：")
        if input_persona != 'j':
            self.persona_for_question = input_persona
        input_instr = input("填写生成数据集时的instruction，跳过请输入‘j’：")
        if input_instr != 'j':
            self.instr_for_question = input_instr

        self.text_gen.persona = self.persona_for_question
        self.text_gen.instruction = self.instr_for_question

        return self.text_gen

    def generateQuiz(self):
        """
        :return: Initial.initialize()
        """

        with open(self.dataset_path, 'r') as f:
            data = json.load(f)
        sample = data.get('data', [])[:7]
        df = pd.DataFrame(sample)
        columns = df.columns
        ini = Initial.Initialize(self.text_gen)
        proc = MainProcessor.FileUploadProcessor()
        proc.ini = ini
        proc.uploaded(', '.join(columns))
        quiz = proc.get_questions()

        print("数据集总结：")
        print(proc.get_preview())  # 还可打印其余总结
        print("生成的问题如下：")
        for q in quiz:
            print(q)

        return ini

    def generateCharts(self, ini:Initial.Initialize()):
        """
        :param ini: Initial.Initialize() from generateQuiz
        :return:
        """
        self.persona_for_vegalite = ini.persona
        input_persona = input("填写生成图表时的persona，跳过请输入‘j’：")  # 这里最需要填写
        if input_persona != 'j':
            self.persona_for_vegalite = input_persona
        # 这时的instruction包括：数据集名字、整体概述、对每个属性的描述、问题，需要可以打印出来

        for q in ini.get_questions():
            print(f"对于问题{q}")
            charts = ini.generate(q)
            for c in charts:
                print(c['vega-lite_code'])


if __name__ == '__main__':
    easy = EasyEditing()
    easy.inputForQuiz()
    init = easy.generateQuiz()
    # easy.generateCharts(init)
