import json
import os

dir_path = os.path.dirname(os.path.realpath(__file__))

json_path = os.path.join(dir_path, 'model_prompts.json')


def load_prompts(path=json_path, query: str = ''):
    with open(path, 'r', encoding='utf-8') as f:
        prompts = json.load(f)
    if not query:
        return prompts
    return prompts[query]
