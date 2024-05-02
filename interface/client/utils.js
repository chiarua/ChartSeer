/*************************************************************************
 * Copyright (c) 2018 Jian Zhao
 *
 *************************************************************************
 *
 * @author
 * Jian Zhao <zhao@fxpal.com>
 *
 *************************************************************************/

 // external libs'
import vegaEmbed from 'vega-embed'
import SumView from './sumview.js'
import ChartView from './chartview.js'

var logging = false

var initData = {}

export var vegaConfig = {
    axis: {labelFontSize:9, titleFontSize:9, labelAngle:-45, labelLimit:50},
    legend: {gradientLength:20, labelFontSize:6, titleFontSize:6, clipHeight:20}
}

export function createDataTable(scrollH) {
    var columns = _.keys(app.data.chartdata.values[0]).map((d) => {return {title: d} })
    var tabledata = app.data.chartdata.values.map((d) => {
        var record = []
        for(var i = 0; i < columns.length; i++)
            record.push(d[columns[i].title])
        return record
    })

    if(app.datatable) {
        app.datatable.destroy()
        $('#dataview table').empty()
    }
    app.datatable = $('#dataview table').DataTable({
        columnDefs: [
            {
                targets: '_all', 
                render: function(data, type, row, meta) {
                    return '<span style="color:' 
                        + app.sumview._varclr(columns[meta.col].title) + '">' + data + '</span>'
                }
            }
        ],
        data: tabledata,
        columns: columns,
        scrollY: scrollH,
        scrollX: true,
        paging: false,
        scrollCollapse: true,
        searching: false,
        info: false
    })  

    columns.forEach((c) => {
        $('#legend').append('/<span class="legend-item" style="color:' + app.sumview._varclr(c.title) + '">' + c.title + '</span>')
    })
}

export function displayAllCharts(container, created) {
    $(container).empty()
    // container = '#suggestionview'
    // created = true

    app.sumview.charts.forEach((ch) => {
        if(ch.created == created) {
        // if(true) {
            $(container).append($('<div />', {id: 'chartall' + ch.chid}))

            if(container == '#suggestionview') {
                var vegachart = _.extend({}, ch.originalspec,  
                    { width: 230, height: 130, autosize: 'fit' }, 
                    { data: {values: app.data.chartdata.values} },
                    { config: vegaConfig})
                $('#chartall' + ch.chid).css({'display': 'flex', 'justify-content': 'space-between','align-items': 'center'})
            }else {
                var vegachart = _.extend({}, ch.originalspec, 
                    // { width: 270, height: 125, autosize: 'fit' }, 
                    { width: 150, height: 100, autosize: 'fit' }, 
                    { data: {values: app.data.chartdata.values} },
                    { config: vegaConfig})
            }
            
            $('#chartall' + ch.chid).append($('<div />', {class: 'chartdiv', id: 'chart' + ch.chid}))

            if(container == '#suggestionview') {
                $('#chartall' + ch.chid).append($('<div />', {class: 'chartdiv', id: 'chartdesc' + ch.chid}))
                $('#chartdesc' + ch.chid).append($(`
                    <h4> What is the relationship between Housepower and Weight_i_lbs? </h3>
                `))
                $('#chartdesc' + ch.chid).append($('<span />'))
                $('#chartdesc' + ch.chid + ' span').text(ch.expl)
                $('#chartdesc' + ch.chid).append($(`
                    <div>
                        <button class='evaluate'> Evaluate </button>
                        <button class='eye'> Show Query </button>
                        <button class='light'> Recommend </button>
                    </div>
                `))
                $('#chartdesc' + ch.chid + ' h4').css('margin', '10px 0 5px 0')
                // , 'text-align': 'justify'
                $('#chartdesc' + ch.chid + ' span').css({'font-size': '14px', 'display': 'block'})
                $('#chartdesc' + ch.chid + ' div').css({'display': 'flex', 'justify-content': 'space-between', 'margin-top': '10px'})
                $('#chartdesc' + ch.chid + ' div' + ' button').css({'font-size': '12px', 'margin': '0 2px', 'height': '25px', 'background-color': 'white', 'border-radius': '5px','border': '1px solid rgb(171, 171, 171)'})
            }

            $('#chart' + ch.chid).append('<div class="chartcontainer"></div>')

            vegaEmbed('#chart' + ch.chid + ' .chartcontainer', vegachart, {actions: false})
            
            $('#chart' + ch.chid).hover((e) => {
                $('#chart' + ch.chid).css('border-color', 'crimson')
                app.sumview.highlight(ch.chid, true)
            }, (e) => {
                $('#chart' + ch.chid).css('border-color', 'lightgray')
                app.sumview.highlight(ch.chid, false)
            }).click((e) => {
                app.sumview.selectedChartID = ch.chid
            })
        }
    })
}

export function handleEvents() {
    app.sumview.on('clickchart', (ch) => {
        app.chartview.update(ch.originalspec, 'outside')

        $('#chartview .chartlabel').css('background-color', ch.created ? '#f1a340' : '#998ec3')
        $('#chartview .chartlabel').html('#' + ch.chid + '-u' + ch.uid)
        if(ch.created) {
            $('#update, #remove').attr('disabled', true)
        }
        else {
            $('#update, #remove').attr('disabled', false)
        }
        
        if(logging) app.logger.push({time:Date.now(), action:'clickchart', data:ch.originalspec})
    })
    .on('mouseoverchart', (ch) => {
        var vegachart = _.extend({}, ch.originalspec, 
            { width: 390, height: 190, autosize: 'fit' }, 
            { data: {values: app.data.chartdata.values} },
            { config: vegaConfig})
        vegaEmbed('#tooltip .chartcontainer', vegachart, {actions: false})
        
        $('#tooltip .chartlabel').css('background-color', ch.created ? '#f1a340' : '#998ec3')
        $('#tooltip .chartlabel').html('#' + ch.chid + '-u' + ch.uid)
    })
    .on('recommendchart', () => {
        displayAllCharts('#suggestionview', true)
        if(logging) app.logger.push({time:Date.now(), action:'recommendchart'})

    })

    app.chartview.on('add-chart', (spec) => {
        if(app.sumview.data.chartspecs.length > 0)
            spec._meta = {chid: app.sumview.data.chartspecs[app.sumview.data.chartspecs.length - 1]._meta.chid + 1, uid: 0}
        else
            spec._meta = {chid:0, uid:0}
        app.sumview.data.chartspecs.push(spec)

        app.sumview.update(() => {app.sumview.selectedChartID = spec._meta.chid })
        
        displayAllCharts('#allchartsview', false)
        $('#suggestionview').empty() 
        
        if(logging) app.logger.push({time:Date.now(), action:'addchart', data:spec})
    })

    app.chartview.on('update-chart', (spec) => {
        spec._meta = app.sumview.data.chartspecs[app.sumview.selectedChartID]._meta
        app.sumview.data.chartspecs[app.sumview.selectedChartID] = spec

        app.sumview.update(() => {app.sumview.selectedChartID = spec._meta.chid })
        displayAllCharts('#allchartsview', false)
        $('#suggestionview').empty()  

        if(logging) app.logger.push({time:Date.now(), action:'updatechart', data:spec})
    })

    app.chartview.on('remove-chart', (spec) => {
        app.sumview.data.chartspecs = app.sumview.data.chartspecs.filter((d) => { return d._meta.chid != app.sumview.selectedChartID })
        app.sumview.update()
        displayAllCharts('#allchartsview', false)
        $('#suggestionview').empty() 

        if(logging) app.logger.push({time:Date.now(), action:'removechart', data:spec})
    })

    $('#import').click(() => {
        $('#dialog').css('display', 'block')
    })

    $('.close').click(() => {
        $('#dialog').css('display', 'none')
    })

    // $('#submit').click(() => {
    //     if($('#inputfile').val()) {
    //         var reader = new FileReader();
    //         reader.onload = function(e) {
    //             var d = JSON.parse(reader.result);
    //             updateData(d, $('#inputfile').val())
    //         };

    //         reader.readAsText(document.getElementById('inputfile').files[0]);
    //     }
    //     else if($('#inputurl').val()) {
    //         $.get($('#inputurl').val()).done((d) => {
    //             updateData(d, $('#inputurl').val())
    //         })
    //     }

    //     $('.close').click()
    // })

    $('#export').click(() => {
        download(JSON.stringify({
                charts: app.sumview.data.chartspecs,
                attributes: app.sumview.data.chartdata.attributes,
                data: app.sumview.data.chartdata.values 
            }, null, '  '), 'datacharts.json', 'text/json')
        if(logging) download(JSON.stringify(app.logger, null, '  '), 'logs.json', 'text/json')
    })

    $('#weight_slider').change(() => {
        var w = $('#weight_slider').val() / 100.0
        $('#weight').html( w.toFixed(2) )
        app.sumview.weight = w
    })

    $('#show_bubble').change(() => {
        var showbubbles = $('#show_bubble').is(':checked')
        app.sumview.showBubbles = showbubbles
    })

    $(window).resize(() => {
        app.sumview.svgsize = [$('#sumview').width(), $('#sumview').height()]
    })

    // 导入用户数据
    $('#importdata').on('change',function(e){
        var file_input = document.getElementById("importdata");
        var file = file_input.files[0];

        const formData = new FormData();
        formData.append('file', file)
        // console.log(formData.get('file'));

        var reader = new FileReader();
        reader.readAsText(this.files[0]);
        reader.onload = function(e) {
            var data = JSON.parse(e.target.result)
            initData = data
        };

        $.ajax({
            dataType: "json",
            data: formData,
            url: "http://localhost:5000/upload",
            type: "post",
            processData: false,
			contentType: false,
            success:function (reponse) {
                var data = reponse
                exporationgoals(data)
            },
            error:function () {
                console.log('error');
            },
        });
    })
}

export function exporationgoals(data) {
    appendGoals(data)

    // $('#addgoal').click((e) => {
    //     addGoal()
    // })

    $('#addgoal').click((e) => {
        var text = getText()
        if(text == '') {
            alert("该内容不能为空！")
        }else {
            data.push(text)
            console.log(data)
            clearText()
            appendGoals(data)
        }
    })

    $('#submit').click((e) => {
        console.log(data);


        // mask
        var res = [
            {
                "explanation": "This scatter plot shows the relationship between the number of cylinders and the fuel efficiency of the vehicles. Each point represents a vehicle, with the x-axis indicating the number of cylinders and the y-axis showing the miles per gallon. This visualization helps to identify if there is a correlation between these two variables.",
                "question": "How does the number of cylinders correlate with the fuel efficiency of the vehicles in the dataset?",
                "vega-lite_code": {
                    "encoding": {
                        "y": {
                            "field": "Miles_per_Gallon",
                            "type": "quantitative"
                        },
                        "x": {
                            "field": "Cylinders",
                            "type": "ordinal"
                        }
                    },
                    "mark": "point"
                }
            },
            {
                "explanation": "This bar chart compares the average fuel efficiency of vehicles grouped by the number of cylinders. It provides an aggregated view to see how the cylinders might typically affect the mileage.",
                "question": "How does the number of cylinders correlate with the fuel efficiency of the vehicles in the dataset?",
                "vega-lite_code": {
                    "encoding": {
                        "y": {
                            // "aggregate": "average",
                            "field": "Miles_per_Gallon",
                            "type": "quantitative"
                        },
                        "x": {
                            "field": "Cylinders",
                            "type": "ordinal"
                        }
                    },
                    "mark": "bar"
                }
            },
            {
                "explanation": "This line chart demonstrates the trend of average fuel efficiency across different cylinder categories over the years. It helps to determine whether the relationship between the number of cylinders and fuel efficiency has changed over time.",
                "question": "How does the number of cylinders correlate with the fuel efficiency of the vehicles in the dataset?",
                "vega-lite_code": {
                    "encoding": {
                        "color": {
                            "field": "Cylinders",
                            "type": "nominal"
                        },
                        "y": {
                            // "aggregate": "average",
                            "field": "Miles_per_Gallon",
                            "type": "quantitative"
                        },
                        "x": {
                            "field": "Year",
                            "timeUnit": "year",
                            "type": "temporal"
                        }
                    },
                    "mark": "line"
                }
            },
            {
                "explanation": "This visualization represents the trend in horsepower over the years, with horsepower on the y-axis and year on the x-axis, showing how horsepower has changed over time.",
                "question": "What is the trend in horsepower and engine displacement over the years?",
                "vega-lite_code": {
                    "encoding": {
                        "y": {
                            "field": "Horsepower",
                            "type": "quantitative"
                        },
                        "x": {
                            "field": "Year",
                            "timeUnit": "year",
                            "type": "temporal"
                        }
                    },
                    "mark": "line"
                }
            },
            {
                "explanation": "This visualization illustrates the trend in engine displacement over the years, with engine displacement on the y-axis and year on the x-axis, indicating how engine sizes have shifted over time.",
                "question": "What is the trend in horsepower and engine displacement over the years?",
                "vega-lite_code": {
                    "encoding": {
                        "y": {
                            "field": "Displacement",
                            "type": "quantitative"
                        },
                        "x": {
                            "field": "Year",
                            "timeUnit": "year",
                            "type": "temporal"
                        }
                    },
                    "mark": "line"
                }
            },
            {
                "explanation": "This visualization depicts a scatter plot comparing horsepower to engine displacement, with each point representing a vehicle, to show the relationship between the two variables.",
                "question": "What is the trend in horsepower and engine displacement over the years?",
                "vega-lite_code": {
                    "encoding": {
                        "color": {
                            "field": "Year",
                            "timeUnit": "year",
                            "type": "temporal"
                        },
                        "y": {
                            "field": "Horsepower",
                            "type": "quantitative"
                        },
                        "x": {
                            "field": "Displacement",
                            "type": "quantitative"
                        }
                    },
                    "mark": "point"
                }
            },
            {
                "explanation": "This visualization uses a line chart to show both horsepower and engine displacement trends over the years on a dual-axis, enabling us to observe the changes in both metrics simultaneously.",
                "question": "What is the trend in horsepower and engine displacement over the years?",
                "vega-lite_code": {
                    "encoding": {
                        "color": {
                            "field": "Origin",
                            "type": "nominal"
                        },
                        "y": {
                            "field": "Horsepower",
                            "type": "quantitative"
                        },
                        // "y2": {
                        //     "field": "Displacement",
                        //     "type": "quantitative"
                        // },
                        "x": {
                            "field": "Year",
                            "timeUnit": "year",
                            "type": "temporal"
                        }
                    },
                    "mark": "line"
                }
            },
            {
                "explanation": "This visualization shows a bar chart comparing the average weight of vehicles from different origins. It allows us to see if there is a significant difference in the average weights for vehicles produced in different regions.",
                "question": "Are there significant differences in average weight and acceleration between vehicles from different origins?",
                "vega-lite_code": {
                    "encoding": {
                        "y": {
                            // "aggregate": "average",
                            "field": "Weight_in_lbs",
                            "type": "quantitative"
                        },
                        "x": {
                            "field": "Origin",
                            "type": "nominal"
                        }
                    },
                    "mark": "bar"
                }
            },
            {
                "explanation": "This visualization presents the average acceleration of vehicles by origin, using a bar chart. It visually represents if there are discrepancies in acceleration capabilities across different vehicle origins.",
                "question": "Are there significant differences in average weight and acceleration between vehicles from different origins?",
                "vega-lite_code": {
                    "encoding": {
                        "y": {
                            // "aggregate": "average",
                            "field": "Acceleration",
                            "type": "quantitative"
                        },
                        "x": {
                            "field": "Origin",
                            "type": "nominal"
                        }
                    },
                    "mark": "bar"
                }
            },
            {
                "explanation": "This visualization displays a scatter plot correlating the weight and acceleration of the vehicles, colored by their origin. This helps to explore if there is any relationship between the weight and acceleration across different origins.",
                "question": "Are there significant differences in average weight and acceleration between vehicles from different origins?",
                "vega-lite_code": {
                    "encoding": {
                        "color": {
                            "field": "Origin",
                            "type": "nominal"
                        },
                        "y": {
                            "field": "Acceleration",
                            "type": "quantitative"
                        },
                        "x": {
                            "field": "Weight_in_lbs",
                            "type": "quantitative"
                        }
                    },
                    "mark": "point"
                }
            }
        ]

        var charts = []
        for(var i = 0; i < res.length; i++) {
            res[i]["vega-lite_code"]._meta = {
                uid: 0,
                chid: i+1
            },
            charts.push(res[i]["vega-lite_code"])
        }
        initData.charts = charts

        updateData(initData, "file")

        // $.ajax({
        //     context: this,
        //     type: 'POST',
        //     crossDomain: true,
        //     url: "http://localhost:5000//updatequiz",
        //     data: JSON.stringify(data),
        //     contentType: 'application/json'
        // }).then((res) => {
        //     console.log(res);

        //     var charts = []
        //     for(var i = 0; i < res.length; i++) {
        //         res[i]["vega-lite_code"]._meta = {
        //             uid: 0,
        //             chid: i+1
        //         },
        //         charts.push(res[i]["vega-lite_code"])
        //     }
        //     initData.charts = charts

        //     console.log(initData, "???");

        //     updateData(initData, "file")
        // })
    })

    function appendGoals(data) {
        $('#goalsexplain').children().remove()
        for(var i = 0; i < data.length; i++) {
            $('#goalsexplain').append($("<div />", {id: 'goal' + i}))
            $('#goal' + i).append(`
                <div class="goal">
                    <span></span>
                    <div class="title"></div>
                    <div class="deleteicon">-</div>
                </div>
                <div class="explain">What is the correlation between the weight of a vehicle and its fuel efficiency?''What is the correlation between the weight of a vehicle and its fuel efficiency?''What is the correlation between the weight of a vehicle and its fuel efficiency?'</div>
            `)
    
            $('#goal' + i + ' .goal' + ' span').text(i+1)
            $('#goal' + i + ' .goal' + ' .title').text(data[i])
    
            $('#goal' + i).css({"width": "95%", "margin": "10px auto"})
            $('#goal' + i + ' .goal').css({"border-radius": "10px 10px 0 0", "background-color": "#a5d5d42b", "padding": "10px 10px 5px 10px", "display": "flex", "justify-content": "space-between"})
            $('#goal' + i + ' .goal' + ' span').css({"height": "20px","display": "inline-block","border-right": "2px solid #7fc8c7","padding-right": "10px","margin-right": "10px"})
            $('#goal' + i + ' .goal' + ' .deleteicon').css({"text-align": "center",
                "color": "rgb(155, 155, 155)",
                "font-size": "30px",
                "line-height": "18px",
                "border": "2px solid rgb(155, 155, 155)",
                "flex": "0 0 auto",
                "width": "20px",
                "height": "20px",
                "border-radius": "50%",})
            $('#goal' + i + ' .explain').css({"border-radius": "0 0 10px 10px",
                "background-color": "#a5d5d42b",
                "padding":  "0 10px 10px 10px",
                "font-size": "15px",
                "display": "none"})
    
            $('#goal' + i + ' .goal' + ' .title').click((e) => {
                var idx = parseInt($(e.target.parentElement.parentElement).attr("id").slice(-1))
                hideAll(idx)
                $(e.currentTarget.parentElement.nextElementSibling).toggle()
            })
    
            $('#goal' + i + ' .goal' + ' .title').dblclick((e) => {
                var text = $(e.target).text()
                $(e.target).html("<input type='text'>")
                $(e.target.firstChild).val(text)
    
                $(e.target.firstChild).css({
                    "height": "25px",
                    "font-size": "16px",
                    "width": "395px"
                })
    
                $(e.target.firstChild).focus().blur(function(){     
                    var newText = $(this).val()           
                    $(e.target).html(newText);
                    var idx = parseInt($(e.target.parentElement.parentElement).attr("id").slice(-1))
                    if(text !== newText) {
                        // todo 修改数组里的数据
                        data.splice(idx, 1, newText)
                        console.log(data);
                    }
                })
    
                $(e.target.firstChild).bind('keypress', function (event) {
                    if (event.keyCode == "13") {
                        var newText = $(this).val()           
                        $(e.target).html(newText);
                        var idx = parseInt($(e.target.parentElement.parentElement).attr("id").slice(-1))
                        if(text !== newText) {
                            // todo 修改数组里的数据
                            data.splice(idx, 1, newText)
                            console.log(data);
                        }
                    }
                })
            })
    
            $('#goal' + i + ' .goal' + ' .deleteicon').click((e) => {
                var idx = parseInt($(e.target.parentElement.parentElement).attr("id").slice(-1))
                data.splice(idx, 1)
                console.log(data);
                appendGoals(data)
                // $(e.target.parentElement.parentElement).remove()
            })
        }
    }

    function getText() {
        return $("#goalTitle").val()
    }

    function clearText() {
        $("#goalTitle").prop("value", "")
    }

    // function addGoal() {
    //     if($("#goalsexplain").children().length == 0) {
    //         idx = 0
    //     }else {
    //         var idx = parseInt($("#goalsexplain").children().eq(-1).attr("id").slice(-1))
    //     }
    //     var text = $("#goalTitle").val()
    //     var newIdx = idx + 1

    //     data.push(text)
    //     console.log(data);

    //     $('#goalsexplain').append($("<div />", {id: 'goal' + newIdx}))
    //     $('#goal' + newIdx).append(`
    //         <div class="goal">
    //             <span></span>
    //             <div class="title"></div>
    //             <div class="deleteicon">-</div>
    //         </div>
    //     `)
    //     // <div class="explain">What is the correlation between the weight of a vehicle and its fuel efficiency?''What is the correlation between the weight of a vehicle and its fuel efficiency?''What is the correlation between the weight of a vehicle and its fuel efficiency?'</div>


    //     $('#goal' + newIdx + ' .goal' + ' span').text(newIdx + 1)
    //     $('#goal' + newIdx + ' .goal' + ' .title').text(text)

    //     $('#goal' + newIdx).css({"width": "95%", "margin": "10px auto"})
    //     $('#goal' + newIdx + ' .goal').css({"border-radius": "10px 10px 0 0", "background-color": "#a5d5d42b", "padding": "10px 10px 5px 10px", "display": "flex", "justify-content": "space-between"})
    //     $('#goal' + newIdx + ' .goal' + ' span').css({"height": "20px","display": "inline-block","border-right": "2px solid #7fc8c7","padding-right": "10px","margin-right": "10px"})
    //     $('#goal' + newIdx + ' .goal' + ' .deleteicon').css({"text-align": "center",
    //         "color": "rgb(155, 155, 155)",
    //         "font-size": "30px",
    //         "line-height": "18px",
    //         "border": "2px solid rgb(155, 155, 155)",
    //         "flex": "0 0 auto",
    //         "width": "20px",
    //         "height": "20px",
    //         "border-radius": "50%",})
    //     // $('#goal' + i + ' .explain').css({"border-radius": "0 0 10px 10px",
    //     //     "background-color": "#a5d5d42b",
    //     //     "padding":  "0 10px 10px 10px",
    //     //     "font-size": "15px",
    //     //     "display": "none"})

    //     $('#goal' + newIdx + ' .goal' + ' .title').click((e) => {
    //         var idx = parseInt($(e.target.parentElement.parentElement).attr("id").slice(-1))
    //         hideAll(idx)
    //         $(e.currentTarget.parentElement.nextElementSibling).toggle()
    //     })

    //     $('#goal' + newIdx + ' .goal' + ' .title').dblclick((e) => {
    //         var text = $(e.target).text()
    //         $(e.target).html("<input type='text'>")
    //         $(e.target.firstChild).val(text)

    //         $(e.target.firstChild).css({
    //             "height": "25px",
    //             "font-size": "16px",
    //             "width": "395px"
    //         })

    //         $(e.target.firstChild).focus().blur(function(){     
    //             var newText = $(this).val()           
    //             $(e.target).html(newText);
    //             var idx = parseInt($(e.target.parentElement.parentElement).attr("id").slice(-1))
    //             if(text !== newText) {
    //                 // todo 修改数组里的数据
    //                 data.splice(idx, 1, newText)
    //                 console.log(data);
    //             }
    //         })

    //         $(e.target.firstChild).bind('keypress', function (event) {
    //             if (event.keyCode == "13") {
    //                 var newText = $(this).val()           
    //                 $(e.target).html(newText);
    //                 var idx = parseInt($(e.target.parentElement.parentElement).attr("id").slice(-1))
    //                 if(text !== newText) {
    //                     // todo 修改数组里的数据
    //                     data.splice(idx, 1, newText)
    //                     console.log(data);
    //                 }
    //             }
    //         })
    //     })

    //     $('#goal' + newIdx + ' .goal' + ' .deleteicon').click((e) => {
    //         var idx = parseInt($(e.target.parentElement.parentElement).attr("id").slice(-1))
    //         data.splice(idx, 1)
    //         console.log(data);
    //         $(e.target.parentElement.parentElement).remove()
    //     })
    // }

    function hideAll(idx) {
        for(var i = 0; i < data.length; i++) {
            if(i == idx) continue
            $('#goal' + i + ' .explain').hide()
        }
    }
}

export function parseurl() {
    var parameters = {}
    var urlquery = location.search.substring(1)
	if(urlquery) {
		urlquery.split("&").forEach(function(part) {
			var item = part.split("=")
    		parameters[item[0]] = decodeURIComponent(item[1])
    		if(parameters[item[0]].indexOf(",") != -1)
                parameters[item[0]] = parameters[item[0]].split(",")
		})
	}

    return parameters
}

export function updateData(data, name) {
    $("#datafile").html(name)

    app.data = {}
    app.data.chartdata = {attributes: data.attributes, values: data.data}
    app.data.chartspecs = data.charts

    console.log('data', data);
    console.log('app.data', app.data);

    app.sumview = new SumView(d3.select('#sumview'), app.data, {
        backend: 'http://localhost:5000',
        size: [$('#sumview').width(), $('#sumview').height()],
        margin: 10,
        chartclr: ['#f1a340', '#998ec3']
    })
    app.sumview.update()

    app.chartview = new ChartView({}, {
        attributes: app.data.chartdata.attributes,
        datavalues: app.data.chartdata.values,
        vegaconfig: vegaConfig
    })

    // 数据集
    createDataTable(280)

    // search();
    // displayAllCharts('#allchartsview', false)
    // displayAllCharts('#suggestionview', true)

    // events handling
    handleEvents()
}
// function search(){
//     const inputDom = document.getElementById("search-input");
//     const searchDom = document.getElementById("search-button");
//     inputDom.addEventListener("input", (e)=>{
//         app.searchValue = e.target.value;
//     });
//     searchDom.addEventListener("click", ()=>{
//         console.log('search button click',app.searchValue)
//         // TODO: 集成接口
//     });
// }

function download(content, fileName, contentType) {
    var a = document.createElement("a");
    var file = new Blob([content], {type: contentType});
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    a.click();
}

export default {vegaConfig, handleEvents, parseurl, createDataTable, displayAllCharts, updateData}