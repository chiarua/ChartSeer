import openai
from openai import OpenAI
import json
import pandas as pd
import os

os.environ["http_proxy"] = "http://localhost:7890"
os.environ["https_proxy"] = "http://localhost:7890"


class TextGenerator:
    def __init__(self):
        self.client = OpenAI()

        self.prompts = self.load_prompts('model_prompts.json')
        self.persona = self.prompts['SUMMARIZE_PROMPT']
        self.instruction = self.prompts['SUMMARIZE_INST']

    def load_prompts(self, path):
        with open(path, 'r') as f:
            prompts = json.load(f)
        return prompts

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
        persona = self.persona
        instruction = self.instruction + self.read_json_and_get_columns(path)
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
