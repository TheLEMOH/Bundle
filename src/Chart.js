function CreateLineWithFocusChart() {
    let chart = nv.models.lineWithFocusChart().interpolate('cardinal').showYAxis(true).showXAxis(true).useInteractiveGuideline(true);
    chart.noData("Нет данных");
    chart.xAxis
        .axisLabel('Время')
        .rotateLabels(10)
        .ticks(10).showMaxMin(false)
        .tickFormat(function (d) {
            return d3.time.format("%Y-%m-%d %H:%M:%S")(new Date(d));
        });
    chart.x2Axis
        .axisLabel('Время')
        .rotateLabels(0)
        .ticks(7)
        .tickFormat(function (d) {
            return d3.time.format("%Y-%m-%d %H:%M:%S")(new Date(d));
        });
    return chart;
};

function CreateMultiChart() {
    let chart = nv.models.multiChart().interpolate('cardinal').useInteractiveGuideline(true);
    chart.noData("Нет данных");
    chart.xAxis
        .axisLabel('Время')
        .rotateLabels(10)
        .ticks(10).showMaxMin(false)
        .tickFormat(function (d) {
            return d3.time.format("%Y-%m-%d %H:%M:%S")(new Date(d));
        });
    return chart;
};

async function RefreshChart(data, chart) {
    let tickmarks_children = document.getElementById('tickmarks').children;
    let time = [];
    let step = Math.ceil(tickmarks_children.length / 12);
    for (let i = 0; i < tickmarks_children.length; i += step) {
        let date = tickmarks_children[i].innerText.split(' ')[0];
        let hours = tickmarks_children[i].innerText.split(' ')[1];
        time.push(new Date(date.split('-')[0], date.split('-')[1] - 1, date.split('-')[2], hours.split(':')[0], hours.split(':')[1], hours.split(':')[2]));
    }
    document.getElementById('chart').innerHTML = "<svg></svg>";
    chart.xAxis.tickValues(time);
    chart.xAxis.ticks(5).orient("bottom");
    d3.select('#chart svg')
        .datum(data)
        .call(chart);
    chart.update();
};

async function RefreshAdditionalChart(data, chart) {
    let tickmarks_children = document.getElementById('tickmarks').children;
    let time = [];
    let step = Math.ceil(tickmarks_children.length / 12);
    for (let i = 0; i < tickmarks_children.length; i += step) {
        let date = tickmarks_children[i].innerText.split(' ')[0];
        let hours = tickmarks_children[i].innerText.split(' ')[1];
        time.push(new Date(date.split('-')[0], date.split('-')[1] - 1, date.split('-')[2], hours.split(':')[0], hours.split(':')[1], hours.split(':')[2]));
    }
    document.getElementById('chart2').innerHTML = "<svg></svg>";
    chart.xAxis.tickValues(time);
    chart.xAxis.ticks(5).orient("bottom");
    d3.select('#chart2 svg')
        .datum(data)
        .call(chart);
    chart.update();
};

async function CloseOpenChart() {
    const buttonOpen = document.getElementById('CloseOpenChartButton');
    if (buttonOpen.innerHTML == 'Закрыть график') {
        buttonOpen.innerHTML = 'Открыть график';
        $('#collapseChartTwo').collapse('hide');
        setTimeout(function () {
            $('#collapseChartOne').collapse('hide');
        }, 500);
        document.getElementById('ChangeChartButton').disabled = true;
    }
    else {
        buttonOpen.innerHTML = 'Закрыть график';
        document.getElementById('ChangeChartButton').disabled = false;
    }
};

let MainChart = CreateLineWithFocusChart();
let AdditionalChart = CreateMultiChart();
export { MainChart, AdditionalChart, RefreshChart, RefreshAdditionalChart, CloseOpenChart }
