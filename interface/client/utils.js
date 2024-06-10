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
// var ques_expl = []
var refine_chart = {}

var recordfilter = [{}, {}, {}, {}, {}, {}, {}, {}, {}, {}]

var attributes
var dataset

export var vegaConfig = {
    axis: {labelFontSize:9, titleFontSize:9, labelAngle:-45, labelLimit:50},
    legend: {gradientLength:20, labelFontSize:6, titleFontSize:6, clipHeight:20}
}

// 进度条
function slider(obj, idx, dataname, maximum = 300) { // maximum最大值默认为100
    var range = document.getElementById(obj + idx),
        bar = range.getElementsByTagName("div")[0],
        progress = bar.children[0],
        dot = bar.children[1],
        num = range.getElementsByTagName("span")[1];
    if(obj == "minrange") {
        bar.className = "minbar";
        progress.className = "minprogress";
        dot.className = "mindot";
        num.className = "minnum";

        $("#maxrange" + idx + " .maxnum").text(0)
        var min = recordfilter[idx-1][dataname + 'min']

        if(min != 0) {
            $("#minrange" + idx + " .minnum").text(min)

            progress.style.width = parseFloat(min) / maximum * 200 + 'px'
            dot.style.left = parseFloat(min) / maximum * 200 - parseFloat(min) / maximum * 20 + 'px'
        }
    } else {
        bar.className = "maxbar";
        progress.className = "maxprogress";
        dot.className = "maxdot";
        num.className = "maxnum";

        progress.style.width = 200 + 'px'
        dot.style.left = 179 + 'px'

        $("#maxrange" + idx + " .maxnum").text(maximum)
        var max = recordfilter[idx-1][dataname + 'max']

        if(max != 300) {
            $("#maxrange" + idx + " .maxnum").text(max)

            progress.style.width = parseFloat(max) / maximum * 200 + 'px'
            dot.style.left = parseFloat(max) / maximum * 200 - parseFloat(max) / maximum * 20 + 'px'
        }
    }

    /*
     * offsetWidth 获取当前节点的宽度 （width + border + padding）
     **/
    // 总长度减去原点覆盖的部分
    var rest = bar.offsetWidth - dot.offsetWidth;
 
    // 鼠标按下事件
    dot.onmousedown = function(ev) {
        /*
            * offsetLeft 获取的是相对于父对象的左边距, 返回的是数值， 没有单位
            */
        let dotL = dot.offsetLeft;
        let e = ev || window.event; //兼容性
        /*
            * clientX 事件属性返回当事件被触发时鼠标指针向对于浏览器页面（或客户区）的水平坐标。
            */
        let mouseX = e.clientX //鼠标按下的位置
        window.onmousemove = function(ev) {
            let e = ev || window.event;
            // 浏览器当前位置减去鼠标按下的位置
            let moveL = e.clientX - mouseX; //鼠标移动的距离
            // 保存newL是必要的    
            let newL = dotL + moveL; //left值
            // 判断最大值和最小值
            if (newL < 0) {
                newL = 0;
            }
            if (newL >= rest) {
                newL = rest;
            }
            // 改变left值
            dot.style.left = newL + 'px';
            // 计算比例
            let bili = newL / rest * maximum;
            num.innerHTML = Math.ceil(bili);
            progress.style.width = bar.offsetWidth * Math.ceil(bili) / maximum + 'px';
            return false; //取消默认事件
        }
        window.onmouseup = function() {
            window.onmousemove = false; //解绑移动事件
            return false;
        }
        return false;
    };
    // 点击进度条
    bar.onclick = function(ev) {
        let left = ev.clientX - range.offsetLeft - dot.offsetWidth / 2;
        if (left < 0) {
            left = 0;
        }
        if (left >= rest) {
            left = rest;
        }
        dot.style.left = left + 'px';
        let bili = left / rest * maximum;
        num.innerHTML = Math.ceil(bili);
        progress.style.width = bar.offsetWidth * Math.ceil(bili) / maximum + 'px';
        return false;
    }
}

// 获取最大值和最小值 to do
function getMinAndMax(data, column) {
    // 最大值
    var max = Math.max.apply(Math, data.map(item => { return item[column] }))
    
    // 最小值
    var min = Math.min.apply(Math, data.map(item => { return item[column] }))

    var obj = {}
    obj.min = min
    obj.max = max

    return obj
}

// 获取所有种类
function getAllCategories(data, column) {
    let arr = []

    for(let i = 0; i < data.length; i++) {
        arr.push(data[i][column])
    }

    let newarr = new Set(arr)

    return [...newarr]
}

// 过滤数据集
function filterDataset() {
    let newdataset = dataset
    let obj = {}
    for(let i = 0; i < attributes.length; i++ ) {
        if(!$.isEmptyObject(recordfilter[i])) {
            let column = attributes[i]

            if(column[1] == "num") {
                let min = recordfilter[i][column[0] + 'min']
                let max = recordfilter[i][column[0] + 'max']
                newdataset = newdataset.filter(item => item[column[0]] >= min && item[column[0]] <= max)
            }else if(column[1] == "str") {
                let choosecategories = recordfilter[i][column[0] + 's']
                newdataset = newdataset.filter(item => choosecategories.indexOf(item[column[0]]) != -1)
            }

            obj.charts = []
            obj.attributes = attributes
            obj.data = newdataset

            updateData(obj, 'file')            
        }
    }

    $("#rowsnum").text(newdataset.length)
    $("#columnsnum").text(attributes.length + 1)

    // 更新goals
    $.ajax({
        dataType: "json",
        data: JSON.stringify(obj),
        url: "http://localhost:5000/uploadjson",
        type: "post",
        contentType: 'application/json',
        success:function (reponse) {
            var data = reponse
            exporationgoals(data)
        },
        error:function () {
            console.log('error');
        },
    });
}

export function createDataTable(scrollH, ifone) {
    var columns = _.keys(app.data.chartdata.values[0]).map((d) => {return {title: d} })

    const imgSrc = require('./assets/images/filter.png')

    attributes = app.data.chartdata.attributes

    if(ifone) {
        $("#rowsnum").text(dataset.length)
        $("#columnsnum").text(attributes.length + 1)
        for(let i = 1; i < columns.length; i++) {
            $("#columns").append($('<div />', {id: 'column' + i}))
            $("#column" + i).append($("<img />").attr('src', imgSrc))
            $("#column" + i).append($('<span />').text(columns[i].title))  
            
            $("#column" + i).click(() => {
                var dataname = attributes[i-1][0]
                var datatype = attributes[i-1][1]

                // console.log(datatype);
    
                var columnname = $("#column" + i).text()
    
                if(datatype == "num") {
                    var minimum = getMinAndMax(dataset, columnname).min
                    var maximum = getMinAndMax(dataset, columnname).max
    
                    // console.log(minimum, maximum);
    
                    $("#rowsandcolumns .rowsandcolumnsbody").append($('<div />', {id: 'numfilter' + i}))
                    $("#numfilter" + i).css({
                        "border": "1px solid rgb(201, 201, 201)",
                        "height": "200px",
                        "margin-bottom": "10px"
                    })
                    $("#numfilter" + i).append(`
                        <div class="numheader">
                            <span class='title'></span>
                            <span class='cancel'>x</span>
                        </div>
                        <div class="numbody">
                        </div>
                        <div class="numfooter">
                        </div>
                        `)
                    
                    $("#numfilter" + i + ' .numbody').append($('<div />', {id: 'minrange' + i}))
                    $("#numfilter" + i + ' .numbody').append($('<div />', {id: 'maxrange' + i}))
    
                    $("#numfilter" + i + ' .numfooter').append(`
                        <button class="conformfilter"> Conform </button>
                        `)
    
                    $("#minrange" + i).css({
                        "width":"200px",
                        "height":"30px",
                        "position":"relative"
                    })
    
                    $("#maxrange" + i).css({
                        "width":"200px",
                        "height":"30px",
                        "position":"relative",
                        "margin-top": "25px"
                    })
    
                    $("#minrange" + i).append(`
                            <span>Min:</span> <span id="minnum">0</span>
                            <div class="minbar">
                                <div class="minprogress"></div>
                                <div class="mindot"></div>
                            </div>
                        `)
                    $("#maxrange" + i).append(`
                        <span>Max:</span> <span id="maxnum">300</span>
                        <div class="maxbar">
                            <div class="maxprogress"></div>
                            <div class="maxdot"></div>
                        </div>
                    `)
    
                    slider("minrange", i, dataname, Math.ceil(maximum))
                    slider("maxrange", i, dataname, Math.ceil(maximum))
    
                    $("#numfilter"+ i +" .numheader .title").text(columnname)
                    $("#numfilter"+ i +" .numheader .cancel").css({
                        "float": "right",
                    })
    
                    $("#numfilter"+ i +" .numheader .cancel").click(() => {
                        $("#numfilter"+ i).remove()
                    })
    
                    $("#numfilter" + i + " .conformfilter").click(() => {
                        var min = $("#numfilter" + i +  " .minnum").text()
                        var max = $("#numfilter" + i +  " .maxnum").text()
                
                        var minandmaxobj = {}
                        minandmaxobj[dataname + "min"] = min
                        minandmaxobj[dataname + "max"] = max
                
                        recordfilter[i-1] = minandmaxobj
    
                        filterDataset()
                    }) 
                }else if(datatype == "str") {
                    var categories = getAllCategories(dataset, columnname)

                    $("#rowsandcolumns .rowsandcolumnsbody").append($('<div />', {id: 'strfilter' + i}))
                    $("#strfilter" + i).css({
                        "border": "1px solid rgb(201, 201, 201)",
                        "height": "180px",
                        "margin-bottom": "10px",
                        "overflow": "auto"
                    })
                    $("#strfilter" + i).append(`
                        <div class="strheader">
                            <span class='title'></span>
                            <span class='cancel'>x</span>
                        </div>
                        <div class="strbody">
                        </div>
                        <div class="strfooter">
                        </div>
                        `)
                    
                        $("#strfilter"+ i +" .strheader .title").text(columnname)
                        $("#strfilter"+ i +" .strheader .cancel").css({
                            "float": "right",
                        })

                    for(let j = 0; j < categories.length; j++) {
                        $("#strfilter" + i + ' .strbody').append($('<div />', {id: 'showcategroy' + j}))
                        $("#strfilter" + i + " #showcategroy" + j).append($(`
                            <input type="checkbox" value="">
                            <span></span>
                            `))
                        
                        $("#strfilter" + i + " #showcategroy" + j).css({
                            "margin-top": "5px"
                        })
                        
                        $("#strfilter" + i + " #showcategroy" + j + ' input').attr("value", categories[j])
                        $("#strfilter" + i + " #showcategroy" + j + ' span').text(categories[j])

                        if(recordfilter[i-1][columnname + 's'] && recordfilter[i-1][columnname + 's'].length > 0) {
                            if(recordfilter[i-1][columnname + 's'].indexOf(categories[j]) != -1) {
                                $("#strfilter" + i + " #showcategroy" + j + ' input').prop('checked', true)
                            }
                        }

                        $("#strfilter" + i + " #showcategroy" + j + ' input').click(function () {
                            let categoryvalue = $("#strfilter" + i + " #showcategroy" + j + ' input').val()
                            if(!recordfilter[i-1][columnname + "s"])
                                recordfilter[i-1][columnname + "s"] = []
                            if ($("#strfilter" + i + " #showcategroy" + j + ' input').prop('checked') == true) {
                                recordfilter[i-1][columnname + "s"].push(categoryvalue)
                            } else {
                                recordfilter[i-1][columnname + "s"] = recordfilter[i-1][columnname + "s"].filter(item => item != categoryvalue)
                            }
                        })
                    }

                    $("#strfilter" + i + ' .strfooter').append(`
                        <button class="conformfilter"> Conform </button>
                        `)

                    $("#strfilter"+ i +" .strheader .cancel").click(() => {
                        $("#strfilter"+ i).remove()
                    })
    
                    $("#strfilter" + i + " .conformfilter").click(() => {
                        filterDataset()
                    })
                }
            })
        }
    }

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

        $('#chartediterdesc .title').html("")
        $('#chartediterdesc .content').html("")

        // 显示对应问题和解释
        if(app.data.explanations.length > 0) {
            $('#chartediterdesc .title').html(app.data.questions[ch.chid])
            $('#chartediterdesc .content').html(app.data.explanations[ch.chid])
        }

        // 记录要修改的图表
        refine_chart = ch.originalspec

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

            dataset = data.data

            updateData(data, 'file', true)
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

    $('#refine').unbind("click").bind("click", (e) => {
        if($.isEmptyObject(refine_chart)) {
            alert("请先选择要修改的图表！")
        }else {
            if($('#refinecontent').val()) {
                var input_value = $('#refinecontent').val()

                var modify_data = {}
                modify_data.target_chart = JSON.parse(JSON.stringify(refine_chart))
                modify_data.user_input = input_value

                $.ajax({
                    data: JSON.stringify(modify_data),
                    url: "http://localhost:5000/modify",
                    type: "post",
                    contentType: 'application/json',
                    success:function (response) {
                        console.log(response);
                    },
                    error:function () {
                        console.log('error');
                    },
                });
            }else {
                alert("请输入修改内容！")
            }
        }
    })
}

export function exporationgoals(data) {
    appendGoals(data)

    // $('#addgoal').click((e) => {
    //     addGoal()
    // })

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

        $('#goalinput').children().remove()
        $('#goalinput').append(`
            <input type="text" name="" id="goalTitle" placeholder="Add Goals..."><button id="addgoal"> <img alt="..." width="18px"> Add </button>
            <button id="submit"> Submit </button>
            `)
        
        const imgEdit = require('./assets/images/edit.png')
        $('#goalinput img').attr("src", imgEdit)

        
        $('#addgoal').click((e) => {
            var text = getText()
            if(text == '') {
                alert("该内容不能为空！")
            }else {
                data.push(text)
                // console.log(data)
                clearText()
                appendGoals(data)
            }
        })
    
        $('#submit').click((e) => {
            $.ajax({
                context: this,
                type: 'POST',
                crossDomain: true,
                url: "http://localhost:5000//updatequiz",
                data: JSON.stringify(data),
                contentType: 'application/json'
            }).then((res) => {
                // 全局记录 questions & explanations
                // app.data.ques_expl = res.charts
    
                var res_charts = res.charts
    
                var charts = []
                var questions = []
                var explanations = [] 
                for(var i = 0; i < res_charts.length; i++) {
                    res_charts[i]["vega-lite_code"]._meta = {
                        uid: 0,
                        chid: i
                    }
                    // res_charts[i]["vega-lite_code"].explanation = res_charts[i]["explanation"]
                    // res_charts[i]["vega-lite_code"].question = res_charts[i]["question"]
                    charts.push(res_charts[i]["vega-lite_code"])
                    questions.push(res_charts[i]["question"])
                    explanations.push(res_charts[i]["explanation"])
                }
                initData.charts = charts
                initData.questions = questions
                initData.explanations = explanations
    
                console.log('initData', initData);
    
                updateData(initData, "file", false)
            })
        })
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

export function initInterface(data, name) {
    $("#datafile").html(name)

    app.data = {}
    app.data.chartdata = {attributes: data.attributes, values: data.data}
    app.data.chartspecs = data.charts

    app.data.ques_expl = []

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
    // createDataTable(280)

    // search();
    // displayAllCharts('#allchartsview', false)
    // displayAllCharts('#suggestionview', true)

    // events handling
    handleEvents()
}

export function updateData(data, name, ifone) {
    $("#datafile").html(name)

    app.data = {}
    app.data.chartdata = {attributes: data.attributes, values: data.data}
    app.data.chartspecs = data.charts

    app.data.questions = data.questions
    app.data.explanations = data.explanations

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
    createDataTable(280, ifone)

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