def load_prompts(path="D:\\UPC DL\\ChartSeer\\interface\\LLMVisual\\model_prompts.json", query: str = ''):
    with open(path, 'r', encoding='utf-8') as f:
        prompts = json.load(f)
    if not query:
        return prompts
    return prompts[query]