import openai
from openai import OpenAI
import json
import pandas as pd
import os

os.environ["http_proxy"] = "http://localhost:7890"
os.environ["https_proxy"] = "http://localhost:7890"

DESCRIPTION_PROMPT = f"""\n You are an experienced data analyst that can annotate datasets. Your instructions are as 
follows: 
i) ALWAYS generate the name of the dataset and the dataset_description 
ii) ALWAYS generate a field description. 
iii.) ALWAYS give me THREE questions that data visualization can solve about the relationships and 
trends between the data in a given data set, including terms such as connections, differences, trends, etc 
You must return an updated JSON dictionary without any preamble or explanation.
Based on the above three constraints, the JSON file you will generate should have only four keys:
name, dataset_description, field_description, questions\n"""

SUMMARIZE_INST = "接下来你将读到目标数据集的前7列，为json格式，请根据目标数据集的数据属性总结其内容，你的输出应当为json格式，目标数据集如下："


class TextGenerator:
    def __init__(self):
        self.client = OpenAI()

    def generate(self, persona: str, instruction: str):
        system_message = {"role": "system",
                          "content": instruction}
        client = self.client
        response = client.chat.completions.create(
            messages=[system_message, {"role": "user", "content": persona}],
            temperature=0.9,
            model="gpt-4-turbo-preview",
            response_format={"type": "json_object"}
        )
        message = json.loads(response.choices[0].message.content)

        return message

    def dataset_preview(self, path) -> dict:
        persona = DESCRIPTION_PROMPT
        instruction = SUMMARIZE_INST + self.read_json_and_get_columns(path)
        dic = self.generate(persona, instruction)
        return dic

    def read_json_and_get_columns(self, path):
        with open(path, 'r') as f:
            data = json.load(f)
        attributes = data.get('attributes', {})
        sample = data.get('data', [])[:7]
        df = pd.DataFrame(sample)
        columns = df.columns
        return ', '.join(columns)


tg = TextGenerator()
print(tg.dataset_preview("staticdata/cars.json"))
