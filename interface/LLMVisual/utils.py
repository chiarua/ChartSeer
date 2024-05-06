import json
import os

dir_path = os.path.dirname(os.path.realpath(__file__))

json_path = os.path.join(dir_path, 'model_prompts.json')
spec_path = os.path.join(dir_path, 'rules-cfg.txt')


def load_prompts(path=json_path, query: str = ''):
    with open(path, 'r', encoding='utf-8') as f:
        prompts = json.load(f)
    if not query:
        return prompts
    return prompts[query]


def parse_specs():
    '''
    'color': [['aggregate', 'field', 'type'], ['bin', 'field', 'type'], ...
    '''
    with open(spec_path, 'r') as f:
        specs = f.read()

    spec_dict = {}
    lines = specs.strip().split('\n')
    for line in lines:
        key, value = line.split(' -> ')
        values = value.split('+')
        nv = []
        for v in values:
            t = v.replace('"', '')
            t = t.replace(' ', '')
            nv.append(t)
        values = set(nv)
        if key not in spec_dict:
            spec_dict[key] = [values]
        else:
            spec_dict[key].append(values)
    return spec_dict


def fix_vegalite_spec_recur(json_spec, spec_dict):
    new_json_spec = {}
    for key in json_spec:
        value = json_spec[key]
        if key == "bin":
            new_json_spec[key] = value
        if isinstance(value, dict):
            if key not in spec_dict:
                new_json_spec[key] = fix_vegalite_spec_recur(value, spec_dict)
                continue
            lst = set(list(value.keys()))
            if lst not in spec_dict[key]:
                print(f"键 '{key}' 的值 '{lst}' 不在规范中")
            else:
                print(f"键 '{key}' 的值 '{lst}' 在规范中")
                new_json_spec[key] = fix_vegalite_spec_recur(value, spec_dict)
        elif isinstance(value, str):
            if key not in spec_dict:
                new_json_spec[key] = value
                continue
            if {value} not in spec_dict[key]:
                print(f"键 '{key}' 的值 '{value}' 不在规范中")
            else:
                print(f"键 '{key}' 的值 '{value}' 在规范中")
                new_json_spec[key] = value
    return new_json_spec


print(parse_specs())
specs = parse_specs()
jstr = '''
{
            "encoding": {
                "y": {
                    "field": "Miles_per_Gallon",
                    "type": "quantitative"
                },
                "x": {
                    "field": "Year",
                    "type": "temporal",
                    "timeUnit": "year"
                },
                "color":{}
            },
            "mark": "point"
        }
    '''
json_str = json.loads(jstr)

#check_vegalite_spec(json_str, specs)

print(fix_vegalite_spec_recur(json_str, specs))