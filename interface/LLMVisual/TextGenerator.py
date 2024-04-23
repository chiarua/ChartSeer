from openai import OpenAI
import json
import pandas as pd
import os
import utils

os.environ["http_proxy"] = "http://localhost:7890"
os.environ["https_proxy"] = "http://localhost:7890"


class TextGenerator:
    def __init__(self):
        self.client = OpenAI()

        self.prompts = utils.load_prompts()
        try:
            self.persona = utils.load_prompts(query='DESCRIPTION_PROMPT')
            self.instruction = utils.load_prompts(query='SUMMARIZE_INST')
        except KeyError as e:
            raise ValueError(f"Key {e} does not exist in the JSON file.")

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

    def dataset_preview(self, dataset: str) -> dict:
        persona = self.persona
        instruction = self.instruction + dataset
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
