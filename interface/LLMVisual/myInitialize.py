import openai
from openai import OpenAI
import json
import pandas as pd
import os
os.environ["http_proxy"] = "http://localhost:7890"
os.environ["https_proxy"] = "http://localhost:7890"

DESCRIPTION_PROMPT = f"""\n You are an experienced data analyst that can annotate datasets. Your instructions are as follows:
i) ALWAYS generate the name of the dataset and the dataset_description
ii) ALWAYS generate a field description.
iii.) ALWAYS generate THREE questions
You must return an updated JSON dictionary without any preamble or explanation.\n"""

SUMMARIZE_PROMPT = """
You are an experienced data analyst that can annotate datasets. Your instructions are as follows:
i) ALWAYS generate the name of the dataset and the dataset_description
ii) ALWAYS generate a field description.
iii.) ALWAYS generate a semantic_type (a single word) for each field given its values e.g. company, city, number, supplier, location, gender, longitude, latitude, url, ip address, zip code, email, etc
You must return an updated JSON dictionary without any preamble or explanation.
"""

SUMMARIZE_INST = "接下来你将读到目标数据集的前7列，为json格式，请根据目标数据集的数据属性总结其内容，你的输出应当为json格式，其中只有一个名为‘preview’的键，其值为你的总结内容。目标数据集如下："


class TextGenerator:
    def __init__(self):
        self.client = OpenAI()

    def generate(self, persona:str, instruction:str):
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

    def dataset_preview(self, path)->str:
        persona = SUMMARIZE_PROMPT
        instruction = SUMMARIZE_INST + self.read_json_and_get_columns(path)
        dic = self.generate(persona, instruction)
        dataset_description = dic['preview']['dataset_description']
        return dataset_description

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
