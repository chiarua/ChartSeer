import VegaLiteGenerator

per = '''我想要分析这个车辆数据集，参考以下只有设计属性的可视化图表，给出多种完整的可视化图表，并进行解释 只有设计属性的可视化图表：[ "{"encoding": {"size": {"field": "num", "timeUnit": "year", "type": "nominal"}, "x": {"aggregate": "mean", "field": "num", "type": "nominal"}, "y": {"bin": true, "field": "num", "type": "nominal"}}, "mark": "line"}", "{"encoding": {"color": {"field": "num", "timeUnit": "month", "type": "ordinal"}, "x": {"aggregate": "mean", "field": "num", "type": "ordinal"}, "y": {"field": "num", "type": "ordinal"}}, "mark": "point"}", "{"encoding": {"color": {"field": "num", "type": "temporal"}, "size": {"aggregate": "sum", "field": "num", "type": "temporal"}, "x": {"bin": true, "field": "num", "type": "temporal"}, "y": {"aggregate": "sum", "field": "num", "type": "temporal"}}, "mark": "circle"}", "{"encoding": {"size": {"field": "str", "timeUnit": "month", "type": "nominal"}, "x": {"field": "str", "timeUnit": "month", "type": "nominal"}, "y": {"field": "str", "timeUnit": "month", "type": "nominal"}}, "mark": "line"}", "{"encoding": {"x": {"field": "str", "timeUnit": "year", "type": "ordinal"}, "y": {"bin": true, "field": "str", "type": "ordinal"}}, "mark": "tick"}", "{"encoding": {"color": {"aggregate": "count", "field": "str", "type": "nominal"}, "x": {"aggregate": "count", "field": "str", "type": "nominal"}, "y": {"aggregate": "count", "field": "str", "type": "nominal"}}, "mark": "circle"}", "{"encoding": {"shape": {"field": "str", "timeUnit": "day", "type": "ordinal"}, "x": {"field": "str", "timeUnit": "day", "type": "ordinal"}, "y": {"field": "str", "timeUnit": "day", "type": "ordinal"}}, "mark": "area"}", "{"encoding": {"x": {"field": "str", "timeUnit": "day", "type": "ordinal"}, "y": {"aggregate": "sum", "field": "str", "type": "ordinal"}}, "mark": "tick"}", "{"encoding": {"shape": {"field": "num", "type": "nominal"}, "x": {"field": "num", "type": "nominal"}, "y": {"field": "num", "timeUnit": "day", "type": "nominal"}}, "mark": "point"}", "{"encoding": {"x": {"field": "str", "type": "quantitative"}, "y": {"field": "str", "type": "quantitative"}}, "mark": "circle"}", "{"encoding": {"shape": {"aggregate": "mean", "field": "num", "type": "temporal"}, "x": {"bin": true, "field": "num", "type": "temporal"}, "y": {"field": "num", "timeUnit": "year", "type": "temporal"}}, "mark": "point"}", "{"encoding": {"detail": {"aggregate": "count", "field": "str", "type": "temporal"}, "shape": {"aggregate": "count", "field": "str", "type": "temporal"}, "x": {"field": "str", "timeUnit": "month", "type": "temporal"}, "y": {"bin": true, "field": "str", "type": "temporal"}}, "mark": "bar"}", "{"encoding": {"x": {"field": "num", "timeUnit": "year", "type": "nominal"}, "y": {"field": "num", "type": "nominal"}}, "mark": "point"}", "{"encoding": {"color": {"bin": true, "field": "str", "type": "nominal"}, "x": {"bin": true, "field": "str", "type": "nominal"}, "y": {"bin": true, "field": "str", "type": "nominal"}}, "mark": "area"}", "{"encoding": {"detail": {"field": "str", "type": "quantitative"}, "size": {"aggregate": "sum", "field": "str", "type": "quantitative"}, "x": {"aggregate": "sum", "field": "str", "type": "quantitative"}, "y": {"field": "str", "type": "quantitative"}}, "mark": "area"}", "{"encoding": {"color": {"field": "str", "timeUnit": "day", "type": "temporal"}, "detail": {"field": "str", "type": "temporal"}, "x": {"field": "str", "timeUnit": "day", "type": "temporal"}, "y": {"field": "str", "timeUnit": "day", "type": "temporal"}}, "mark": "point"}", "{"encoding": {"color": {"field": "num", "type": "nominal"}, "size": {"aggregate": "mean", "field": "num", "type": "nominal"}, "x": {"field": "num", "timeUnit": "day", "type": "nominal"}, "y": {"bin": true, "field": "num", "type": "nominal"}}, "mark": "bar"}", "{"encoding": {"shape": {"field": "num", "type": "quantitative"}, "x": {"field": "num", "timeUnit": "month", "type": "quantitative"}, "y": {"bin": true, "field": "num", "type": "quantitative"}}, "mark": "line"}", "{"encoding": {"x": {"field": "num", "type": "temporal"}, "y": {"aggregate": "mean", "field": "num", "type": "temporal"}}, "mark": "point"}", "{"encoding": {"size": {"field": "str", "timeUnit": "month", "type": "nominal"}, "x": {"aggregate": "count", "field": "str", "type": "nominal"}, "y": {"aggregate": "count", "field": "str", "type": "nominal"}}, "mark": "bar"}", "{"encoding": {"color": {"bin": true, "field": "num", "type": "quantitative"}, "size": {"aggregate": "mean", "field": "num", "type": "quantitative"}, "x": {"field": "num", "type": "quantitative"}, "y": {"field": "num", "timeUnit": "month", "type": "quantitative"}}, "mark": "bar"}", "{"encoding": {"color": {"field": "num", "type": "nominal"}, "x": {"field": "num", "timeUnit": "day", "type": "nominal"}, "y": {"bin": true, "field": "num", "type": "nominal"}}, "mark": "area"}", "{"encoding": {"shape": {"field": "num", "timeUnit": "year", "type": "nominal"}, "size": {"field": "num", "type": "nominal"}, "x": {"bin": true, "field": "num", "type": "nominal"}, "y": {"aggregate": "mean", "field": "num", "type": "nominal"}}, "mark": "tick"}", "{"encoding": {"detail": {"field": "num", "timeUnit": "day", "type": "nominal"}, "x": {"bin": true, "field": "num", "type": "nominal"}, "y": {"field": "num", "timeUnit": "day", "type": "nominal"}}, "mark": "bar"}", "{"encoding": {"x": {"aggregate": "sum", "field": "num", "type": "nominal"}, "y": {"bin": true, "field": "num", "type": "nominal"}}, "mark": "circle"}" ]数据集： "attributes": [["Miles_per_Gallon", "num", "quantitative"], ["Cylinders", "num", "ordinal"], ["Displacement", "num", "quantitative"], ["Horsepower", "num", "quantitative"], ["Weight_in_lbs", "num", "quantitative"],["Acceleration", "num", "quantitative"], ["Year", "str", "temporal"], ["Origin", "str", "nominal"]], "data": [ { "Name":"chevrolet chevelle malibu", "Miles_per_Gallon":18, "Cylinders":8, "Displacement":307, "Horsepower":130, "Weight_in_lbs":3504, "Acceleration":12, "Year":"1970-01-01", "Origin":"USA" }, { "Name":"buick skylark 320", "Miles_per_Gallon":15, "Cylinders":8, "Displacement":350, "Horsepower":165, "Weight_in_lbs":3693, "Acceleration":11.5, "Year":"1970-01-01", "Origin":"USA" }, { "Name":"plymouth satellite", "Miles_per_Gallon":18, "Cylinders":8, "Displacement":318, "Horsepower":150, "Weight_in_lbs":3436, "Acceleration":11, "Year":"1970-01-01", "Origin":"USA" }, { "Name":"amc rebel sst", "Miles_per_Gallon":16, "Cylinders":8, "Displacement":304, "Horsepower":150, "Weight_in_lbs":3433, "Acceleration":12, "Year":"1970-01-01", "Origin":"USA" }, { "Name":"ford torino", "Miles_per_Gallon":17, "Cylinders":8, "Displacement":302, "Horsepower":140, "Weight_in_lbs":3449, "Acceleration":10.5, "Year":"1970-01-01", "Origin":"USA" }, { "Name":"ford galaxie 500", "Miles_per_Gallon":15, "Cylinders":8, "Displacement":429, "Horsepower":198, "Weight_in_lbs":4341, "Acceleration":10, "Year":"1970-01-01", "Origin":"USA" }, { "Name":"chevrolet impala", "Miles_per_Gallon":14, "Cylinders":8, "Displacement":454, "Horsepower":220, "Weight_in_lbs":4354, "Acceleration":9, "Year":"1970-01-01", "Origin":"USA" }, { "Name":"plymouth fury iii", "Miles_per_Gallon":14, "Cylinders":8, "Displacement":440, "Horsepower":215, "Weight_in_lbs":4312, "Acceleration":8.5, "Year":"1970-01-01", "Origin":"USA" }, { "Name":"pontiac catalina", "Miles_per_Gallon":14, "Cylinders":8, "Displacement":455, "Horsepower":225, "Weight_in_lbs":4425, "Acceleration":10, "Year":"1970-01-01", "Origin":"USA" }, { "Name":"amc ambassador dpl", "Miles_per_Gallon":15, "Cylinders":8, "Displacement":390, "Horsepower":190, "Weight_in_lbs":3850, "Acceleration":8.5, "Year":"1970-01-01", "Origin":"USA" }, { "Name":"citroen ds-21 pallas", "Miles_per_Gallon":null, "Cylinders":4, "Displacement":133, "Horsepower":115, "Weight_in_lbs":3090, "Acceleration":17.5, "Year":"1970-01-01", "Origin":"Europe" }, { "Name":"chevrolet chevelle concours (sw)", "Miles_per_Gallon":null, "Cylinders":8, "Displacement":350, "Horsepower":165, "Weight_in_lbs":4142, "Acceleration":11.5, "Year":"1970-01-01", "Origin":"USA" }, { "Name":"ford torino (sw)", "Miles_per_Gallon":null, "Cylinders":8, "Displacement":351, "Horsepower":153, "Weight_in_lbs":4034, "Acceleration":11, "Year":"1970-01-01", "Origin":"USA" }, { "Name":"plymouth satellite (sw)", "Miles_per_Gallon":null, "Cylinders":8, "Displacement":383, "Horsepower":175, "Weight_in_lbs":4166, "Acceleration":10.5, "Year":"1970-01-01", "Origin":"USA" }, { "Name":"amc rebel sst (sw)", "Miles_per_Gallon":null, "Cylinders":8, "Displacement":360, "Horsepower":175, "Weight_in_lbs":3850, "Acceleration":11, "Year":"1970-01-01", "Origin":"USA" }, { "Name":"dodge challenger se", "Miles_per_Gallon":15, "Cylinders":8, "Displacement":383, "Horsepower":170, "Weight_in_lbs":3563, "Acceleration":10, "Year":"1970-01-01", "Origin":"USA" }, { "Name":"plymouth 'cuda 340", "Miles_per_Gallon":14, "Cylinders":8, "Displacement":340, "Horsepower":160, "Weight_in_lbs":3609, "Acceleration":8, "Year":"1970-01-01", "Origin":"USA" }, { "Name":"ford mustang boss 302", "Miles_per_Gallon":null, "Cylinders":8, "Displacement":302, "Horsepower":140, "Weight_in_lbs":3353, "Acceleration":8, "Year":"1970-01-01", "Origin":"USA" } ]'''
vlg = Initialize.VegaLiteGenerator()
result = vlg.generate(per)
# vega_lite_codes = [element['message']['vega-lite_code'] for element in result if 'message' in element and 'vega-lite_code' in element['message']]
print(vlg.get_codes(),vlg.get_explanation())


