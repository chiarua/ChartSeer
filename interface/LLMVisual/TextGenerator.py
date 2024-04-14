from openai import OpenAI
import json
import pandas as pd
import os

os.environ["http_proxy"] = "http://localhost:7890"
os.environ["https_proxy"] = "http://localhost:7890"

class TextGenerator:
    def __init__(self):
        self.client = OpenAI()

        self.prompts = self.load_prompts()
        self.persona = self.prompts['DESCRIPTION_PROMPT']
        self.instruction = self.prompts['SUMMARIZE_INST']
        self.PATH = "D:\\UPC DL\\ChartSeer\\interface\\LLMVisual\\model_prompts.json"

    def load_prompts(self, path="D:\\UPC DL\\ChartSeer\\interface\\LLMVisual\\model_prompts.json", query: str = ''):
        with open(path, 'r', encoding='utf-8') as f:
            prompts = json.load(f)
        if not query:
            return prompts
        return prompts[query]

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
        instruction = self.instruction + self.read_json(path)
        dic = self.generate(persona, instruction)
        return dic

    def read_json(self, path):
        with open(path, 'r') as f:
            data = json.load(f)
        attributes = data.get('attributes', {})
        sample = data.get('data', [])[:7]
        df = pd.DataFrame(sample)
        columns = df.columns
        return ', '.join(columns)

