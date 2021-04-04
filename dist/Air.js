'use strict';

//Обработка данных для NVD3
async function ParseXMLDataForGraph(data, sites, id) {
    let values_XML = data.getElementsByTagName("aggvalues")[0].childNodes;
    let values = [];
    for (let i = 0; i < sites.length; i++) {
        values.push([]);
        for (let j = 0; j < values_XML.length; j++) {
            if (sites[i].id == values_XML[j].getAttribute("site")) {
                values[values.length - 1].push({
                    x: new Date(values_XML[j].getAttribute("time")),
                    y: (id == 348) ? +(parseFloat(values_XML[j].getElementsByTagName("avg")[0].innerHTML * 1000)).toFixed(2) : +(parseFloat(values_XML[j].getElementsByTagName("avg")[0].innerHTML).toFixed(2))
                });
            }
        }
    }
    let Chart_Data = sites.map((e, i) => {
        return {
            key: e.name,
            values: values[i],
        };
    });
    for (let i = 0; i < Chart_Data.length; i++) {
        if (Chart_Data[i].values.length == 0) {
            Chart_Data.splice(i, 1);
            i = i - 1;
        }
    }    return Chart_Data;
}//Обработка данных для слоя
async function ParseXMLDataForLayer(data, time, project) {
    let values_XML = data.getElementsByTagName("aggvalues")[0].childNodes;
    let values = [];
    let values_set = [];

    for (let i = 0; i < time.length; i++) {
        values.push([]);
        for (let j = 0; j < values_XML.length; j++) {
            if (values_XML[j].getAttribute("time") == time[i]) {
                values[values.length - 1].push({
                    id: values_XML[j].getAttribute("site"),
                    value: Number(values_XML[j].getElementsByTagName("avg")[0].innerHTML),
                    project: project
                });
            }
        }
    }
    for (let i = 0; i < time.length; i++) {
        values_set.push(
            {
                time: time[i],
                values: values[i]
            }
        );
    }
    return values_set;
}async function ParseXMLOne(data) {
    const status = data.getElementsByTagName("status")[0].getAttribute("code");
    if (status != -1) {
        let values_XML = data.getElementsByTagName("aggvalues")[0].childNodes;
        let values = [];
        for (let i = 0; i < values_XML.length; i++) {
            values.push({
                time: values_XML[i].getAttribute("time"),
                values: Number(values_XML[i].getElementsByTagName("avg")[0].innerHTML)
            });

        }
        return values;
    }
    else {
        return [];
    }
}async function ParseXMLOneForChart(data, id) {
    const status = data.getElementsByTagName("status")[0].getAttribute("code");
    if (status != -1) {
        let values_XML = data.getElementsByTagName("aggvalues")[0].childNodes;
        let values = [];
        for (let i = 0; i < values_XML.length; i++) {
            values.push({
                x: new Date(values_XML[i].getAttribute("time")),
                y: (id == 348) ? +(parseFloat(values_XML[i].getElementsByTagName("avg")[0].innerHTML * 1000)).toFixed(2) : +(parseFloat(values_XML[i].getElementsByTagName("avg")[0].innerHTML).toFixed(2))
            });

        }
        return values;
    }
    else {
        return [];
    }
}//Обработка постов мониторинга
function ParseXMLSites(data) {
    let Sites_XML = data.getElementsByTagName("site");
    let Sites = [];
    let Dont = [3835, 3839, 3840, 3836, 3889, 3845, 3482, 3822, 3890, 3838, 3848, 3872, 3898]; // Неиспользуемые посты
    for (let i = 0; i < Sites_XML.length; i++) {
        if (Sites_XML[i].getAttribute('code').indexOf('ICAO') == false || Sites_XML[i].getAttribute('code').indexOf('uni') == false || Sites_XML[i].getAttribute('code').indexOf('ugms') == false || Sites_XML[i].getAttribute('code').indexOf('nke') == false || Sites_XML[i].getAttribute('code').indexOf('CA01') == false || Sites_XML[i].getAttribute('code').indexOf('s_') == false) {
            if (Sites_XML[i].getElementsByTagName("location")[0] != undefined)
                Sites.push({
                    name: Sites_XML[i].getElementsByTagName("name")[0].firstChild.data,
                    id: Sites_XML[i].getAttribute("id"),
                    x: Sites_XML[i].getElementsByTagName("location")[0].getAttribute("x"),
                    y: Sites_XML[i].getElementsByTagName("location")[0].getAttribute("y")
                });
        }
    }
    return Sites.filter(site => Dont.indexOf(+site.id) === -1);
}//Domparser
function ParseText(data) {
    const parser = new DOMParser();
    return parser.parseFromString(data, "text/xml");
}
function FindData(data, time) {
    let values = 0;
    for (let i = 0; i < data.length; i++)
        if (data[i].time == time)
            values = data[i].values;
    return values;
}
function AddName(data, sites) {
    for (let i = 0; i < data.length; i++) {
        for (let j = 0; j < sites.length; j++) {
            if (data[i].id == sites[j].id) {
                data[i].name = sites[j].name;
                data[i].x = sites[j].x;
                data[i].y = sites[j].y;
            }
        }
    }

    for (let i = 0; i < data.length; i++) {
        if (data[i].name == undefined) {
            data.splice(i, 1);
            i = i - 1;
        }
    }

    return data;
}

/* Формирование времени */
function GetTime(Day1, Day2, interval) {
    let Date1 = new Date(Day1.split('-')[0], Day1.split('-')[1] - 1, Day1.split('-')[2]);
    let Date2 = new Date(Day2.split('-')[0], Day2.split('-')[1] - 1, Day2.split('-')[2]);
    let limit = d3.time.format("%Y-%m-%d %H:%M:%S")(new Date());
    let All_Date = [];
    switch (interval) {
        case '10min':
            while (Date1.getTime() <= Date2.getTime()) {
                All_Date.push(d3.time.format("%Y-%m-%d %H:%M:%S")(Date1));
                Date1.setMinutes(Date1.getMinutes() + 10);
            }
            break;
        case '20min':
            while (Date1.getTime() <= Date2.getTime()) {
                All_Date.push(d3.time.format("%Y-%m-%d %H:%M:%S")(Date1));
                Date1.setMinutes(Date1.getMinutes() + 20);
            }
            break;
        case '30min':
            while (Date1.getTime() <= Date2.getTime()) {
                All_Date.push(d3.time.format("%Y-%m-%d %H:%M:%S")(Date1));
                Date1.setMinutes(Date1.getMinutes() + 30);
            }
            break;
        case '1hour':
            while (Date1.getTime() <= Date2.getTime()) {
                All_Date.push(d3.time.format("%Y-%m-%d %H:%M:%S")(Date1));
                Date1.setHours(Date1.getHours() + 1);
            }
            break;
        case '2hour':
            while (Date1.getTime() <= Date2.getTime()) {
                All_Date.push(d3.time.format("%Y-%m-%d %H:%M:%S")(Date1));
                Date1.setHours(Date1.getHours() + 2);
            }
            break;
        case '1day':
            while (Date1.getTime() <= Date2.getTime()) {
                All_Date.push(d3.time.format("%Y-%m-%d %H:%M:%S")(Date1));
                Date1.setDate(Date1.getDate() + 1);
            }
            break;
    }
    for (let i = 0; i < All_Date.length; i++)
        if (limit <= All_Date[i]) {
            All_Date = All_Date.slice(0, i);
            break;
        }
    return All_Date;
}/* Список диапазонов */
function GetRange(id) {
    let range = [];
    if (id == 348) {
        return range = [12, 35, 70, 150, 200, 250];
    }
    if (id == 103) {
        return range = [-30, -25, -20, -15, -10, -5, 0, 5, 10, 15, 20, 25, 30];
    }
    if (id == 100) {
        return range = [10, 20, 30, 40, 50, 60, 70, 80, 95];
    }
    if (id == 99) {
        return range = [710, 720, 730, 740, 750, 760, 770, 780];
    }


    return range;
}/* Преобразование диапазонов */
function RangeConversion(range) {
    let result = [];
    for (let i = 0; i < range.length; i++) {
        if (i == 0) {
            result.push(`<${range[i]}`);
            result.push(`${range[i]}-${range[i + 1]}`);
        }
        else
            if (i != range.length - 1)
                result.push(`${range[i]}-${range[i + 1]}`);
            else
                result.push(`${range[i]}<`);
    }
    return result;
}
function RangeConversionMainPoint(range, interval) {
    let newRange = [];
    for (let i = 1; i < range.length; i++) {
        let number = range[i - 1]; //Первая опорная
        const a = range[i] - range[i - 1]; //Разница между опорными точками
        const b = a / (interval + 1); // Шаг между опорными точками
        for (let j = 0; j < (interval + 1); j++) {
            newRange.push(number);
            number += b;  // увеличиваем на один шаг
        }
    }
    newRange.push(range[range.length - 1]);



    return newRange;
}
/* Формирование легенды */
async function LegendFormation(id) {
    document.getElementById('airLegendHeader').innerText = 'Легенда';
    document.getElementById('airLegendBody').innerHTML = '';
    let label;
    let colorScheme = (GetColorScheme('legend', id));
    if (colorScheme == 'none') {
        document.getElementById('airLegendBody').innerHTML += `Легенда отсуствует`;
    }
    else {
        if (id == 348) {
            label = ['Меньше 12', 'От 12 до 35', 'От 35 до 70', 'От 70 до 150', 'От 150 до 200', 'От 200 до 250', 'Больше 250'];
            document.getElementById('airLegendHeader').innerText = 'Концентрация взвешенных частиц Pm 2.5 (мкг)';
        }
        if (id == 103) {
            label = ['Меньше -30', 'От -30 до -25', 'От -25 до -20', 'От -20 до -15', 'От -15 до -10', 'От -10 до -5', 'От -5 до 0', 'От 0 до 5', 'От 5 до 10', 'От 10 до 15', 'От 15 до 20', 'От 20 до 25', 'От 25 до 30', 'Больше 30'];
            document.getElementById('airLegendHeader').innerText = 'Температура воздуха (С)';
        }
        if (id == 100) {
            label = ['Меньше 10', 'От 10 до 20', 'От 20 до 30', 'От 30 до 40', 'От 40 до 50', 'От 50 до 60', 'От 60 до 70', 'От 70 до 80', 'От 80 до 90', 'Больше 90'];
            document.getElementById('airLegendHeader').innerText = 'Влажность воздуха (%)';
        }
        if (id == 99) {
            label = ['Меньше 710', 'От 710 до 720', 'От 720 до 730', 'От 730 до 740', 'От 740 до 750', 'От 750 до 760', 'От 760 до 770', 'От 770 до 780', 'От 780 до 790', 'Больше 790'];
            document.getElementById('airLegendHeader').innerText = 'Давление воздуха';
        }
        for (let i = 0; i < colorScheme.length; i++) {
            document.getElementById('airLegendBody').innerHTML += `<div class="airLegendItem"><div style="background:${colorScheme[i]};"></div><span>${label[i]}</span></div>`;
        }
    }
}/* Получение настроек из меню пользователя */

function formatDate(date) {

    var dd = date.getDate();
    if (dd < 10) dd = '0' + dd;

    var mm = date.getMonth() + 1;
    if (mm < 10) mm = '0' + mm;

    var yy = date.getFullYear();
    if (yy < 10) yy = '0' + yy;

    return yy + '-' + mm + '-' + dd;
}

function GetAttributes() {
    const My_Datepicker_value = document.getElementById('day').value.replace(/\s+/g, '').split(".");
    /*     const new_date = new Date(My_Datepicker_value[2], My_Datepicker_value[1], My_Datepicker_value[0]); */
    /*     const day_one = My_Datepicker_value.split(':')[0];
        const day_two = My_Datepicker_value.split(':')[1]; */
    let day_one = formatDate(new Date(My_Datepicker_value[2], My_Datepicker_value[1] - 1, 1));
    let day_two = formatDate(new Date(My_Datepicker_value[2], My_Datepicker_value[1], 0));

    const interval = document.getElementById('timeinterval').value;
    const layerID = document.getElementById('airChangeLayer').value ? document.getElementById('airChangeLayer').value : 0;
    let indicators = document.getElementsByClassName('radio');
    let indicator_id = [];
    let indicator_name = [];
    for (let i = 0; i < indicators.length; i++)
        if (indicators[i].checked == true) {
            indicator_id.push(indicators[i].value);
            indicator_name.push(indicators[i].nextSibling.innerHTML);
        }
    let stations = document.getElementsByName('radio2');
    let station_id;
    for (let i = 0; i < stations.length; i++)
        if (stations[i].checked == true)
            station_id = stations[i].value;

    const Station_List = document.getElementsByClassName('AirStationListItem');
    const checkedComparison = document.getElementById('AirRadioComparison').checked;
    let Station_List_Id = 0;

    if (checkedComparison) {
        Station_List_Id = [[], [], []];
        for (let i = 0; i < Station_List.length; i++) {
            if (Station_List[i].checked == true) {
                if (Station_List[i].value == 1)
                    Station_List_Id[0].push({
                        id: Station_List[i].id.split('_')[1],
                        project: Station_List[i].value
                    });
                if (Station_List[i].value == 9)
                    Station_List_Id[1].push({
                        id: Station_List[i].id.split('_')[1],
                        project: Station_List[i].value
                    });
                if (Station_List[i].value == 8)
                    Station_List_Id[2].push({
                        id: Station_List[i].id.split('_')[1],
                        project: Station_List[i].value
                    });
            }
        }
    }
    return {
        day_one: day_one,
        day_two: day_two,
        interval: interval,
        station_id: station_id,
        indicator_id: indicator_id,
        indicator_name: indicator_name,
        Station_List_Id: Station_List_Id,
        layerID: layerID
    }
}/* Настройки для календаря */
function FillDate() {
    $('#day').datepicker({
        navTitles: {
            days: 'MM, yyyy'
        },
        dateFormat: 'yyyy-mm-dd',
    });
    let myDatepicker = $('#day').datepicker().data('datepicker');
    let day_1 = new Date();
    let day_2 = new Date();
    day_2.setDate(day_1.getDate() + 1);
    myDatepicker.selectDate(day_1);
    myDatepicker.selectDate(day_2);
}/* Добавление времени на линейку */
function PushTimeInSlide(Time) {
    $("#tickmarks").children().remove();
    for (let i = 0; i < Time.length; i++) {
        $("#tickmarks").append('<option value="' + i + '">' + Time[i] + '</option>');
    }
    $("#range_footer").attr("min", 0);
    $("#range_footer").attr("max", Time.length - 1);
}/* Генерирование цветовой схемы по опорным точками */

function GenerateColorMainPoint(colorScheme, inverval) {
    let newColorSheme = [];
    for (let i = 1; i < colorScheme.length; i++) {
        newColorSheme.push(...GenerateColor(colorScheme[i], colorScheme[i - 1], inverval));
    }
    return newColorSheme;
}
/* Генерирование градиента по двум точкам */
function GenerateColor(colorStart, colorEnd, colorCount) {
    // The beginning of your gradient
    var start = [
        colorStart.split(',')[0].split('rgb(')[1],
        colorStart.split(',')[1],
        colorStart.split(',')[2].split(')')[0],
    ];
    // The end of your gradient
    var end = [
        colorEnd.split(',')[0].split('rgb(')[1],
        colorEnd.split(',')[1],
        colorEnd.split(',')[2].split(')')[0],
    ];
    // The number of colors to compute
    var len = colorCount;
    //Alpha blending amount
    var alpha = 0.0;
    var saida = [];
    saida.push(colorEnd);
    for (let i = 0; i < len; i++) {
        var c = [];
        alpha += (1.0 / len);
        c[0] = (start[0] * alpha + (1 - alpha) * end[0]).toFixed(0);
        c[1] = (start[1] * alpha + (1 - alpha) * end[1]).toFixed(0);
        c[2] = (start[2] * alpha + (1 - alpha) * end[2]).toFixed(0);
        saida.push(`rgb(${c[0]},${c[1]},${c[2]})`);
    }
    return saida;
}
/* Получение цветовой схемы */
function GetColorScheme(type, id, range, value) {
    let colorScheme = 'none';
    if (id == 348) {
        colorScheme = [
            'rgb(0,153,102)',
            'rgb(255,222,51)',
            'rgb(255,153,51)',
            'rgb(204,0,51)',
            'rgb(102,0,153)',
            'rgb(126,0,35)',
            'rgb(0,0,0)'
        ];
    }    if (id == 103) {
        colorScheme = ["rgb(0,0,160)", "rgb(23,15,145)", "rgb(46,30,130)", "rgb(69,45,116)", "rgb(92,60,101)", "rgb(115,75,87)", "rgb(139,90,72)", "rgb(162,105,58)", "rgb(185,120,43)", "rgb(208,135,29)", "rgb(231,150,14)", "rgb(255,166,0)", "rgb(255,110,0)", "rgb(255,55,0)"];
    }    if (id == 102) {
        colorScheme = ['rgb(239,243,255)', 'rgb(198,219,239)', 'rgb(158,202,225)', 'rgb(107,174,214)', 'rgb(49,130,189)', 'rgb(8,81,156)'];
    }
    if (id == 100) {
        colorScheme = [
            "rgb(255,45,0)",
            "rgb(255,90,0)",
            "rgb(255,100,0)",
            "rgb(255,150,0)",
            "rgb(255,200,0)",
            "rgb(0,179,255)",
            "rgb(0,134,255)",
            "rgb(0,89,255)",
            "rgb(0,44,255)",
            "rgb(0,20,255)",];
    }
    if (id == 99) {
        colorScheme = ["rgb(37,75,233)", "rgb(60,67,223)", "rgb(84,58,213)", "rgb(107,50,202)", "rgb(131,42,192)", "rgb(154,33,182)", "rgb(177,25,171)", "rgb(201,16,161)", "rgb(224,8,151)", "rgb(247,9,141)"];
    }    if (type == 'd3') {
        let c20 = d3.scale.category20(), col = d3.range(20).map(function (c) {
            return c20(c).replace("#", "0x")
        });
        const rgb = Hex_To_Rgb(c20(id));
        return 'rgb(' + rgb['r'] + ',' + rgb['g'] + ',' + rgb['b'] + ')';
    }    if (type == 'dots') {
        for (let i = 0; i < range.length; i++) {
            if (value <= range[i])
                return colorScheme[i];
            if (value > range[range.length - 1])
                return colorScheme[colorScheme.length - 1];
        }    }    if (type == 'polygons') {
        for (let i = 0; i < range.length; i++) {
            if (value == range[i]) {
                return colorScheme[i];
            }        }    }    if (type == 'legend') {
        return colorScheme;
    }    return colorScheme;
}
function GetColorForVoronoi(colorScheme, range, value) {
    if (value <= +range[0].slice(1)) return colorScheme[0]

    for (let i = 1; i < range.length - 1; i++) {
        const ranges = range[i].split('-');
        if (value < +ranges[1] && value >= +ranges[0]) {
            return colorScheme[i];
        }    }
    if (value > +range[range.length - 1].slice(0, -1)) return colorScheme[colorScheme.length - 1]
}
async function ChangeWindSpeed(data) {
    document.getElementById("windspeed").innerText = data.toFixed(1) + ' м/с';
}
async function ChangeDirectionArrow(data) {
    document.getElementById("Direction_Arrow").style = "transform: rotate(" + data + "deg);";
}

async function Download(Time, attribution) {
    const layerID = (attribution.layerID != 0) ? attribution.layerID : attribution.indicator_id[0];
    const key = '654hblgm9gl8367h';
    const url_data = 'https://gis.krasn.ru/sc/api/1.0/projects/' + attribution.station_id + '/aggvalues?key=' + key + '&time_begin=' + attribution.day_one + '&time_end=' + attribution.day_two + '&indicators=' + layerID + '&time_interval=' + attribution.interval + '&limit=300000';
    const url_sets = 'https://gis.krasn.ru/sc/api/1.0/projects/' + attribution.station_id + '/sites?key=' + key + '&&time_begin=' + attribution.day_one + '&time_end=' + attribution.day_two + '&indicators=' + layerID + '';
    const url_wind_dir = 'https://gis.krasn.ru/sc/api/1.0/projects/1/aggvalues?sites=3833&key=' + key + '&time_begin=' + attribution.day_one + '&time_end=' + attribution.day_two + '&indicators=101&time_interval=' + attribution.interval + '&limit=30000';
    const url_wind_speed = 'https://gis.krasn.ru/sc/api/1.0/projects/1/aggvalues?sites=3833&key=' + key + '&time_begin=' + attribution.day_one + '&time_end=' + attribution.day_two + '&indicators=102&time_interval=' + attribution.interval + '&limit=30000';
    const RawData = fetch(url_data);
    const RawDataSites = fetch(url_sets);
    const RawWindSpeed = fetch(url_wind_speed);
    const RawWindDirection = fetch(url_wind_dir);
    const DataSites = await RawDataSites.then(res => res.text()).then(res => (ParseText(res))).then(res => ParseXMLSites(res));
    const Data = await RawData.then(res => res.text()).then(res => ParseText(res));
    let WindSpeed = await RawWindSpeed.then(res => res.text()).then(res => ParseText(res));
    let WindDirection = await RawWindDirection.then(res => res.text()).then(res => ParseText(res));
    const DataForGraph = ParseXMLDataForGraph(Data, DataSites, layerID);
    const DataForLayer = ParseXMLDataForLayer(Data, Time, attribution.station_id);
    WindSpeed = ParseXMLOne(WindSpeed);
    WindDirection = ParseXMLOne(WindDirection);
    return {
        DataSites,
        DataForGraph: await DataForGraph,
        DataForLayer: await DataForLayer,
        WindSpeed: await WindSpeed,
        WindDirection: await WindDirection
    }
}
async function DownloadIndividual(Time, attribution, SitesList) {
    const key = '654hblgm9gl8367h';
    const url_wind_dir = 'https://gis.krasn.ru/sc/api/1.0/projects/1/aggvalues?sites=3833&key=' + key + '&time_begin=' + attribution.day_one + '&time_end=' + attribution.day_two + '&indicators=101&time_interval=' + attribution.interval + '&limit=30000';
    const url_wind_speed = 'https://gis.krasn.ru/sc/api/1.0/projects/1/aggvalues?sites=3833&key=' + key + '&time_begin=' + attribution.day_one + '&time_end=' + attribution.day_two + '&indicators=102&time_interval=' + attribution.interval + '&limit=30000';
    const RawWindSpeed = fetch(url_wind_speed);
    const RawWindDirection = fetch(url_wind_dir);
    const ListStation = attribution.Station_List_Id;
    let DataForGraph = [];
    let DataForLayer = Time.map(e => {
        return {
            time: e,
            values: []
        };
    });
    for (let i = 0; i < ListStation.length; i++) {
        for (let j = 0; j < ListStation[i].length; j++) {
            const layerID = (attribution.layerID != 0) ? attribution.layerID : attribution.indicator_id[0];
            const url_dataset = 'https://gis.krasn.ru/sc/api/1.0/projects/' + ListStation[i][j].project + '/aggvalues?sites=' + ListStation[i][j].id + '& key=paaqyrklx1d1ehik&time_begin=' + attribution.day_one + '&time_end=' + attribution.day_two + '&indicators=' + layerID + '&time_interval=' + attribution.interval + '&limit=300000';
            const RawData = fetch(url_dataset);
            const Data = await RawData.then(res => res.text()).then(res => ParseText(res));
            const Graph = ParseXMLDataForGraph(Data, SitesList, layerID);
            const Layer = await ParseXMLDataForLayer(Data, Time, ListStation[i][j].project);
            for (let k = 0; k < Layer.length; k++) {
                for (let q = 0; q < DataForLayer.length; q++) {
                    if (Layer[k].time == DataForLayer[q].time) {
                        DataForLayer[q].values.push(...Layer[k].values);
                    }
                }
            }
            DataForGraph.push(...await Graph);
        }    }    let WindSpeed = await RawWindSpeed.then(res => res.text()).then(res => ParseText(res));
    let WindDirection = await RawWindDirection.then(res => res.text()).then(res => ParseText(res));
    WindSpeed = ParseXMLOne(WindSpeed);
    WindDirection = ParseXMLOne(WindDirection);
    return {
        DataForGraph,
        DataForLayer,
        DataSites: SitesList,
        WindSpeed: await WindSpeed,
        WindDirection: await WindDirection
    }

}
async function DownloadSitesList() {
    let attribution = GetAttributes();
    const key = '654hblgm9gl8367h';
    const SitesFullList = [];
    const url_stationset_regionl = 'https://gis.krasn.ru/sc/api/1.0/projects/1/sites?key=' + key + '&&time_begin=' + attribution.day_one + '&time_end=' + attribution.day_two + '&indicators=' + attribution.indicator_id[0] + '';
    const url_stationset_knc = 'https://gis.krasn.ru/sc/api/1.0/projects/9/sites?key=' + key + '&&time_begin=' + attribution.day_one + '&time_end=' + attribution.day_two + '&indicators=' + attribution.indicator_id[0] + '';
    const url_stationset_nebo = 'https://gis.krasn.ru/sc/api/1.0/projects/8/sites?key=' + key + '&&time_begin=' + attribution.day_one + '&time_end=' + attribution.day_two + '&indicators=' + attribution.indicator_id[0] + '';

    let Sites_Set_Regional = fetch(url_stationset_regionl);
    let Sites_Set_KNC = fetch(url_stationset_knc);
    let Sites_Set_Nebo = fetch(url_stationset_nebo);

    Sites_Set_Regional = await Sites_Set_Regional.then(res => res.text());
    Sites_Set_Regional = ParseText(Sites_Set_Regional);
    Sites_Set_Regional = ParseXMLSites(Sites_Set_Regional);

    Sites_Set_KNC = await Sites_Set_KNC.then(res => res.text());
    Sites_Set_KNC = ParseText(Sites_Set_KNC);
    Sites_Set_KNC = ParseXMLSites(Sites_Set_KNC);

    Sites_Set_Nebo = await Sites_Set_Nebo.then(res => res.text());
    Sites_Set_Nebo = ParseText(Sites_Set_Nebo);
    Sites_Set_Nebo = ParseXMLSites(Sites_Set_Nebo);

    document.getElementsByClassName('AirStationContent')[0].innerHTML = '';
    document.getElementsByClassName('AirStationContent')[1].innerHTML = '';
    document.getElementsByClassName('AirStationContent')[2].innerHTML = '';

    for (let i = 0; i < Sites_Set_Regional.length; i++) {
        document.getElementsByClassName('AirStationContent')[0].innerHTML += `<div><input type="checkbox" class="AirStationListItem" id="AirStation_${Sites_Set_Regional[i].id}" value="1"></input><label for="AirStation_${Sites_Set_Regional[i].id}">${Sites_Set_Regional[i].name}</label></div>`;
    }
    for (let i = 0; i < Sites_Set_KNC.length; i++) {
        document.getElementsByClassName('AirStationContent')[1].innerHTML += `<div><input type="checkbox" class="AirStationListItem" id="AirStation_${Sites_Set_KNC[i].id}" value="9"></input><label for="AirStation_${Sites_Set_KNC[i].id}">${Sites_Set_KNC[i].name}</label></div>`;
    }
    for (let i = 0; i < Sites_Set_Nebo.length; i++) {
        document.getElementsByClassName('AirStationContent')[2].innerHTML += `<div><input type="checkbox" class="AirStationListItem" id="AirStation_${Sites_Set_Nebo[i].id}" value="8"></input><label for="AirStation_${Sites_Set_Nebo[i].id}">${Sites_Set_Nebo[i].name}</label></div>`;
    }

    SitesFullList.push(...Sites_Set_Regional);
    SitesFullList.push(...Sites_Set_KNC);
    SitesFullList.push(...Sites_Set_Nebo);

    return SitesFullList;
}
async function DownloadWind(Time, attribution) {
    /* Ссылки */
    const key = '654hblgm9gl8367h';
    const url_wind_dir = 'https://gis.krasn.ru/sc/api/1.0/projects/1/aggvalues?s&key=' + key + '&time_begin=' + attribution.day_one + '&time_end=' + attribution.day_two + '&indicators=101&time_interval=' + attribution.interval + '&limit=30000';
    const url_wind_speed = 'https://gis.krasn.ru/sc/api/1.0/projects/1/aggvalues?&key=' + key + '&time_begin=' + attribution.day_one + '&time_end=' + attribution.day_two + '&indicators=102&time_interval=' + attribution.interval + '&limit=30000';
    const url_wind_speed_metar = 'https://gis.krasn.ru/sc/api/1.0/projects/10/aggvalues?&key=' + key + '&time_begin=' + attribution.day_one + '&time_end=' + attribution.day_two + '&indicators=102&time_interval=' + attribution.interval + '&limit=30000';
    const url_wind_dir_metar = 'https://gis.krasn.ru/sc/api/1.0/projects/10/aggvalues?s&key=' + key + '&time_begin=' + attribution.day_one + '&time_end=' + attribution.day_two + '&indicators=101&time_interval=' + attribution.interval + '&limit=30000';
    const url_wind_speed_ugms = 'https://gis.krasn.ru/sc/api/1.0/projects/5/aggvalues?&key=' + key + '&time_begin=' + attribution.day_one + '&time_end=' + attribution.day_two + '&indicators=102&time_interval=' + attribution.interval + '&limit=30000';
    const url_wind_dir_ugms = 'https://gis.krasn.ru/sc/api/1.0/projects/5/aggvalues?s&key=' + key + '&time_begin=' + attribution.day_one + '&time_end=' + attribution.day_two + '&indicators=101&time_interval=' + attribution.interval + '&limit=30000';
    const url_stationset = 'https://gis.krasn.ru/sc/api/1.0/projects/1/sites?key=' + key + '&&time_begin=' + attribution.day_one + '&time_end=' + attribution.day_two + '&indicators=102';
    const url_stationset_metar = 'https://gis.krasn.ru/sc/api/1.0/projects/10/sites?key=' + key + '&&time_begin=' + attribution.day_one + '&time_end=' + attribution.day_two + '&indicators=102';
    const url_stationset_ugms = 'https://gis.krasn.ru/sc/api/1.0/projects/5/sites?key=' + key + '&&time_begin=' + attribution.day_one + '&time_end=' + attribution.day_two + '&indicators=102';
    /* Посты */
    const RawDataStations = fetch(url_stationset);
    const RawDataStationsMETAR = fetch(url_stationset_metar);
    const RawDataStationsUGMS = fetch(url_stationset_ugms);
    const SitesSet = await RawDataStations.then(res => res.text()).then(res => ParseText(res)).then(res => ParseXMLSites(res));
    const SitesSetMETAR = await RawDataStationsMETAR.then(res => res.text()).then(res => ParseText(res)).then(res => ParseXMLSites(res));
    const SitesSetUGMS = await RawDataStationsUGMS.then(res => res.text()).then(res => ParseText(res)).then(res => ParseXMLSites(res));
    SitesSet.push(...SitesSetMETAR);
    SitesSet.push(...SitesSetUGMS);
    /* Данные */
    const RawDataWindSpeed = fetch(url_wind_speed);
    const RawDataWindDirection = fetch(url_wind_dir);
    const RawDataWindSpeedMETAR = fetch(url_wind_speed_metar);
    const RawDataWindDirectionMETAR = fetch(url_wind_dir_metar);
    const RawDataWindSpeedUGMS = fetch(url_wind_speed_ugms);
    const RawDataWindDirectionUGMS = fetch(url_wind_dir_ugms);
    /* Обработаныне данные */
    const WindSpeed = await RawDataWindSpeed.then(res => res.text()).then(res => ParseText(res)).then(res => ParseXMLDataForLayer(res, Time, 1));
    const WindDirection = await RawDataWindDirection.then(res => res.text()).then(res => ParseText(res)).then(res => ParseXMLDataForLayer(res, Time, 1));
    const WindSpeedMETAR = await RawDataWindSpeedMETAR.then(res => res.text()).then(res => ParseText(res)).then(res => ParseXMLDataForLayer(res, Time, 1));
    const WindDirectionMETAR = await RawDataWindDirectionMETAR.then(res => res.text()).then(res => ParseText(res)).then(res => ParseXMLDataForLayer(res, Time, 1));
    const WindSpeedUGMS = await RawDataWindSpeedUGMS.then(res => res.text()).then(res => ParseText(res)).then(res => ParseXMLDataForLayer(res, Time, 1));
    const WindDirectionUGMS = await RawDataWindDirectionUGMS.then(res => res.text()).then(res => ParseText(res)).then(res => ParseXMLDataForLayer(res, Time, 1));

    WindSpeed.push(...WindSpeedMETAR);
    WindDirection.push(...WindDirectionMETAR);
    WindSpeed.push(...WindSpeedUGMS);
    WindDirection.push(...WindDirectionUGMS);

    for (let i = 0; i < WindSpeed.length; i++) {
        for (let j = 0; j < WindSpeed.length; j++) {
            if (WindSpeed[i].time === WindSpeed[j].time && i != j) {
                for (let k = 0; k < WindSpeed[j].values.length; k++) {
                    WindSpeed[i].values.push(WindSpeed[j].values[k]);
                    WindDirection[i].values.push(WindDirection[j].values[k]);
                }
                WindSpeed.splice(j, 1);
                WindDirection.splice(j, 1);
            }
        }
    }

    return {
        SitesSet,
        WindSpeed,
        WindDirection
    };
}
async function DownLoadMultiIndicator(turn) {
    const DataSet = [];
    for (let e in turn) {

        const id = turn[e].id;
        const name = turn[e].name;
        const project = turn[e].project;

        const key = '654hblgm9gl8367h';
        const attribution = GetAttributes();
        const Indicators = attribution.indicator_id;
        const IndicatorsName = attribution.indicator_name;
        const PromiseData = [];

        for (let i = 0; i < Indicators.length; i++) {
            const url_dataset = 'https://gis.krasn.ru/sc/api/1.0/projects/' + project + '/aggvalues?sites=' + id + '&key=' + key + '&time_begin=' + attribution.day_one + '&time_end=' + attribution.day_two + '&indicators=' + Indicators[i] + '&time_interval=' + attribution.interval + '&limit=300000';
            PromiseData.push(fetch(url_dataset).then(res => res.text()).then(res => ParseText(res)).then(res => ParseXMLOneForChart(res, Indicators[i])));
        }

        for (let i = 0; i < PromiseData.length; i++) {
            const DataForInterface = await PromiseData[i];
            DataSet.push(
                {
                    key: name + ' ' + IndicatorsName[i],
                    type: 'line',
                    yAxis: (i % 2) + 1,
                    color: (i % 2 == 0) ? 'rgba(20,120,251, 1)' : 'rgba(102,0,153,1)',
                    values: DataForInterface
                });
        }
    }

    return DataSet;
}

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
}
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
}
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
}
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
}
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
}
let MainChart = CreateLineWithFocusChart();
let AdditionalChart = CreateMultiChart();

var type = "Feature";
var properties = {
};
var geometry = {
	type: "Polygon",
	coordinates: [
		[
			[
				92.626488,
				55.970884999999996
			],
			[
				92.62732899999999,
				55.973081
			],
			[
				92.653138,
				55.975902
			],
			[
				92.655841,
				55.978873
			],
			[
				92.659753,
				55.978842
			],
			[
				92.659162,
				55.981001
			],
			[
				92.654097,
				55.982181
			],
			[
				92.652231,
				55.984918
			],
			[
				92.65328699999999,
				55.989988
			],
			[
				92.65199899999999,
				55.991327
			],
			[
				92.652261,
				55.994921
			],
			[
				92.65431199999999,
				56.002545999999995
			],
			[
				92.656016,
				56.004774999999995
			],
			[
				92.656824,
				56.012982
			],
			[
				92.653562,
				56.018316
			],
			[
				92.655908,
				56.017781
			],
			[
				92.656725,
				56.021848999999996
			],
			[
				92.650806,
				56.021404999999994
			],
			[
				92.64988,
				56.023761
			],
			[
				92.648088,
				56.023767
			],
			[
				92.64803099999999,
				56.025053
			],
			[
				92.654583,
				56.024891
			],
			[
				92.658937,
				56.030421999999994
			],
			[
				92.65383,
				56.032891
			],
			[
				92.65162699999999,
				56.036069999999995
			],
			[
				92.65623699999999,
				56.036806
			],
			[
				92.659891,
				56.039241
			],
			[
				92.666344,
				56.040876
			],
			[
				92.671281,
				56.043777
			],
			[
				92.67795,
				56.045078
			],
			[
				92.683146,
				56.048125
			],
			[
				92.697727,
				56.051407
			],
			[
				92.69592999999999,
				56.054815
			],
			[
				92.696737,
				56.055326
			],
			[
				92.696355,
				56.056649
			],
			[
				92.69747799999999,
				56.057195
			],
			[
				92.701957,
				56.057696
			],
			[
				92.70606,
				56.059129999999996
			],
			[
				92.713804,
				56.060519
			],
			[
				92.714766,
				56.060956
			],
			[
				92.71467,
				56.062022999999996
			],
			[
				92.7166,
				56.061803999999995
			],
			[
				92.727237,
				56.063798
			],
			[
				92.72817099999999,
				56.065200999999995
			],
			[
				92.728296,
				56.063576
			],
			[
				92.73257699999999,
				56.067021
			],
			[
				92.732598,
				56.067482999999996
			],
			[
				92.728535,
				56.068343
			],
			[
				92.731157,
				56.068632
			],
			[
				92.734186,
				56.070266
			],
			[
				92.735968,
				56.069311
			],
			[
				92.736043,
				56.067861
			],
			[
				92.73751299999999,
				56.067025
			],
			[
				92.738056,
				56.06547
			],
			[
				92.732624,
				56.061865999999995
			],
			[
				92.73160399999999,
				56.058814999999996
			],
			[
				92.73383799999999,
				56.058198
			],
			[
				92.73981099999999,
				56.058854
			],
			[
				92.74072799999999,
				56.058102999999996
			],
			[
				92.746709,
				56.056808
			],
			[
				92.74828699999999,
				56.055685
			],
			[
				92.74929499999999,
				56.055873999999996
			],
			[
				92.750483,
				56.054483
			],
			[
				92.760457,
				56.066635
			],
			[
				92.760846,
				56.069320999999995
			],
			[
				92.78017,
				56.069317999999996
			],
			[
				92.77862999999999,
				56.073265
			],
			[
				92.781482,
				56.073043999999996
			],
			[
				92.785324,
				56.071073999999996
			],
			[
				92.79377699999999,
				56.060215
			],
			[
				92.797173,
				56.057764999999996
			],
			[
				92.79688499999999,
				56.054482
			],
			[
				92.799191,
				56.051992999999996
			],
			[
				92.801588,
				56.051474999999996
			],
			[
				92.802658,
				56.050568999999996
			],
			[
				92.803603,
				56.046726
			],
			[
				92.809697,
				56.048119
			],
			[
				92.80858099999999,
				56.048887
			],
			[
				92.822914,
				56.050863
			],
			[
				92.831535,
				56.051379
			],
			[
				92.83373499999999,
				56.04835
			],
			[
				92.83491,
				56.048291
			],
			[
				92.837436,
				56.041523999999995
			],
			[
				92.838382,
				56.041816
			],
			[
				92.844321,
				56.044756
			],
			[
				92.848109,
				56.048389
			],
			[
				92.848715,
				56.049845999999995
			],
			[
				92.84561099999999,
				56.050194999999995
			],
			[
				92.845158,
				56.050804
			],
			[
				92.84978199999999,
				56.052174
			],
			[
				92.848738,
				56.054247999999994
			],
			[
				92.849744,
				56.055096999999996
			],
			[
				92.858014,
				56.055766
			],
			[
				92.870975,
				56.059675
			],
			[
				92.869028,
				56.064856999999996
			],
			[
				92.87091799999999,
				56.065265
			],
			[
				92.871021,
				56.066353
			],
			[
				92.868206,
				56.072679
			],
			[
				92.86770399999999,
				56.076854
			],
			[
				92.867674,
				56.078474
			],
			[
				92.869232,
				56.079753999999994
			],
			[
				92.86883999999999,
				56.082819
			],
			[
				92.870145,
				56.084418
			],
			[
				92.87745199999999,
				56.084692
			],
			[
				92.89595299999999,
				56.091229999999996
			],
			[
				92.89475999999999,
				56.094085
			],
			[
				92.88788799999999,
				56.095039
			],
			[
				92.887672,
				56.095909999999996
			],
			[
				92.89137,
				56.100074
			],
			[
				92.89013399999999,
				56.109328
			],
			[
				92.890864,
				56.112497999999995
			],
			[
				92.894832,
				56.116831999999995
			],
			[
				92.895518,
				56.118790999999995
			],
			[
				92.898781,
				56.119062
			],
			[
				92.902987,
				56.120957999999995
			],
			[
				92.902084,
				56.117996
			],
			[
				92.908481,
				56.114965999999995
			],
			[
				92.90843199999999,
				56.114157
			],
			[
				92.911869,
				56.11714
			],
			[
				92.910625,
				56.121041
			],
			[
				92.91716199999999,
				56.122189999999996
			],
			[
				92.918375,
				56.121209
			],
			[
				92.919209,
				56.121477999999996
			],
			[
				92.918121,
				56.122479999999996
			],
			[
				92.926299,
				56.122794999999996
			],
			[
				92.92746799999999,
				56.121703999999994
			],
			[
				92.930385,
				56.122685999999995
			],
			[
				92.933787,
				56.122460999999994
			],
			[
				92.943123,
				56.121427999999995
			],
			[
				92.94807399999999,
				56.119617999999996
			],
			[
				92.942065,
				56.113541999999995
			],
			[
				92.927183,
				56.108582999999996
			],
			[
				92.924951,
				56.104457999999994
			],
			[
				92.930544,
				56.1025
			],
			[
				92.937328,
				56.101206
			],
			[
				92.94603699999999,
				56.10405
			],
			[
				92.947474,
				56.099525
			],
			[
				92.95088899999999,
				56.098555999999995
			],
			[
				92.957177,
				56.093661999999995
			],
			[
				92.96116099999999,
				56.093478999999995
			],
			[
				92.964196,
				56.094305999999996
			],
			[
				92.97021199999999,
				56.09444
			],
			[
				92.966645,
				56.092095
			],
			[
				92.96522,
				56.092150999999994
			],
			[
				92.962953,
				56.090999999999994
			],
			[
				92.953164,
				56.088457
			],
			[
				92.951799,
				56.087221
			],
			[
				92.951906,
				56.085857
			],
			[
				92.96176299999999,
				56.088587
			],
			[
				92.975752,
				56.095411
			],
			[
				92.97623,
				56.095138999999996
			],
			[
				92.988615,
				56.100733999999996
			],
			[
				92.988056,
				56.10122
			],
			[
				92.991632,
				56.10313
			],
			[
				92.994523,
				56.10823
			],
			[
				92.99436299999999,
				56.115418
			],
			[
				92.991468,
				56.118173999999996
			],
			[
				92.980307,
				56.121928
			],
			[
				92.970119,
				56.121043
			],
			[
				92.962655,
				56.133649999999996
			],
			[
				92.98562299999999,
				56.132766
			],
			[
				92.990701,
				56.133376
			],
			[
				92.992156,
				56.130353
			],
			[
				92.99175199999999,
				56.129129999999996
			],
			[
				92.99701999999999,
				56.126483
			],
			[
				92.99656,
				56.123104
			],
			[
				93.000999,
				56.120422
			],
			[
				93.00107,
				56.118257
			],
			[
				92.999817,
				56.117129999999996
			],
			[
				93.00340299999999,
				56.116633
			],
			[
				93.004542,
				56.115525999999996
			],
			[
				93.00366199999999,
				56.113932999999996
			],
			[
				93.007323,
				56.112548999999994
			],
			[
				93.012025,
				56.113988
			],
			[
				93.01454299999999,
				56.114081999999996
			],
			[
				93.01825799999999,
				56.116875
			],
			[
				93.02745999999999,
				56.115555
			],
			[
				93.026996,
				56.115054
			],
			[
				93.07123299999999,
				56.109319
			],
			[
				93.07978,
				56.111919
			],
			[
				93.084094,
				56.114788999999995
			],
			[
				93.086621,
				56.115536999999996
			],
			[
				93.089911,
				56.114948
			],
			[
				93.09699599999999,
				56.120129
			],
			[
				93.09796,
				56.122631999999996
			],
			[
				93.103766,
				56.124074
			],
			[
				93.110002,
				56.123334
			],
			[
				93.10891099999999,
				56.121278999999994
			],
			[
				93.114587,
				56.122063999999995
			],
			[
				93.119829,
				56.116735999999996
			],
			[
				93.11948699999999,
				56.115493
			],
			[
				93.124023,
				56.109933
			],
			[
				93.128424,
				56.109215999999996
			],
			[
				93.13046399999999,
				56.104929999999996
			],
			[
				93.14707399999999,
				56.106821
			],
			[
				93.154009,
				56.108345
			],
			[
				93.150661,
				56.117895999999995
			],
			[
				93.163708,
				56.109244999999994
			],
			[
				93.16815,
				56.101462999999995
			],
			[
				93.16825299999999,
				56.097896999999996
			],
			[
				93.166315,
				56.094756999999994
			],
			[
				93.163399,
				56.095634
			],
			[
				93.164104,
				56.100652
			],
			[
				93.154574,
				56.105833999999994
			],
			[
				93.131604,
				56.103049
			],
			[
				93.131886,
				56.095161999999995
			],
			[
				93.151206,
				56.082497
			],
			[
				93.150685,
				56.082055
			],
			[
				93.114408,
				56.100271
			],
			[
				93.10744199999999,
				56.096661999999995
			],
			[
				93.092547,
				56.09514
			],
			[
				93.09158699999999,
				56.092726
			],
			[
				93.093515,
				56.088919
			],
			[
				93.091534,
				56.086808
			],
			[
				93.085433,
				56.085775
			],
			[
				93.089173,
				56.084694999999996
			],
			[
				93.089378,
				56.083534
			],
			[
				93.093643,
				56.079330999999996
			],
			[
				93.100895,
				56.076041999999994
			],
			[
				93.097644,
				56.073608
			],
			[
				93.111404,
				56.065467
			],
			[
				93.115792,
				56.060629999999996
			],
			[
				93.12161499999999,
				56.056326999999996
			],
			[
				93.131113,
				56.052715
			],
			[
				93.123768,
				56.05141
			],
			[
				93.093232,
				56.071976
			],
			[
				93.079056,
				56.077614
			],
			[
				93.067235,
				56.079924
			],
			[
				93.05723599999999,
				56.079986
			],
			[
				93.036788,
				56.072998999999996
			],
			[
				93.032466,
				56.075027
			],
			[
				93.030779,
				56.07497
			],
			[
				93.023822,
				56.072942
			],
			[
				93.01867399999999,
				56.070363
			],
			[
				93.018276,
				56.069168
			],
			[
				93.020668,
				56.068805
			],
			[
				93.02064,
				56.068219
			],
			[
				93.018537,
				56.066727
			],
			[
				93.017117,
				56.067358999999996
			],
			[
				93.014924,
				56.066812
			],
			[
				93.018035,
				56.065734
			],
			[
				93.02183199999999,
				56.065718999999994
			],
			[
				93.023558,
				56.063606
			],
			[
				93.027535,
				56.062369
			],
			[
				93.02687,
				56.060931
			],
			[
				93.022916,
				56.059543999999995
			],
			[
				93.03826099999999,
				56.058409999999995
			],
			[
				93.041637,
				56.060275
			],
			[
				93.042346,
				56.064623999999995
			],
			[
				93.05812999999999,
				56.063575
			],
			[
				93.057126,
				56.059929999999994
			],
			[
				93.064117,
				56.053276
			],
			[
				93.073875,
				56.051666999999995
			],
			[
				93.078384,
				56.053658999999996
			],
			[
				93.085352,
				56.050374
			],
			[
				93.08634099999999,
				56.049502
			],
			[
				93.084745,
				56.046507
			],
			[
				93.07685,
				56.042123
			],
			[
				93.07291099999999,
				56.038393
			],
			[
				93.06406,
				56.034363
			],
			[
				93.065429,
				56.033409999999996
			],
			[
				93.064712,
				56.032235
			],
			[
				93.066766,
				56.030603
			],
			[
				93.074889,
				56.037335
			],
			[
				93.077708,
				56.038467
			],
			[
				93.079169,
				56.03738
			],
			[
				93.084003,
				56.038756
			],
			[
				93.093871,
				56.038070999999995
			],
			[
				93.094667,
				56.034434
			],
			[
				93.09315099999999,
				56.034214
			],
			[
				93.09289199999999,
				56.030491999999995
			],
			[
				93.090398,
				56.026567
			],
			[
				93.083612,
				56.026385999999995
			],
			[
				93.08302499999999,
				56.024024999999995
			],
			[
				93.097538,
				56.023897
			],
			[
				93.112394,
				56.022121999999996
			],
			[
				93.11355999999999,
				56.02072
			],
			[
				93.111673,
				56.020055
			],
			[
				93.108425,
				56.014371
			],
			[
				93.094421,
				56.015238999999994
			],
			[
				93.091433,
				56.016608
			],
			[
				93.08180899999999,
				56.019178999999994
			],
			[
				93.070483,
				56.018919999999994
			],
			[
				93.065625,
				56.017768999999994
			],
			[
				93.06412,
				56.008191
			],
			[
				93.066441,
				56.007999
			],
			[
				93.064826,
				56.000758999999995
			],
			[
				93.06437,
				55.999649999999995
			],
			[
				93.061954,
				55.999832
			],
			[
				93.05970699999999,
				55.991837
			],
			[
				93.057951,
				55.990828
			],
			[
				93.05637,
				55.982389999999995
			],
			[
				93.053455,
				55.979617999999995
			],
			[
				93.05209699999999,
				55.978749
			],
			[
				93.04649099999999,
				55.978719
			],
			[
				93.04623699999999,
				55.97944
			],
			[
				93.037633,
				55.981804
			],
			[
				93.03415199999999,
				55.973023
			],
			[
				93.02158299999999,
				55.974534
			],
			[
				93.012672,
				55.976537
			],
			[
				93.000495,
				55.965371999999995
			],
			[
				92.995465,
				55.959672999999995
			],
			[
				92.989778,
				55.957702999999995
			],
			[
				92.98791,
				55.956208
			],
			[
				92.986262,
				55.954269
			],
			[
				92.98648399999999,
				55.952976
			],
			[
				92.98057999999999,
				55.954145
			],
			[
				92.980346,
				55.953669
			],
			[
				92.975678,
				55.953376
			],
			[
				92.97055999999999,
				55.953702
			],
			[
				92.971408,
				55.947663
			],
			[
				92.96472999999999,
				55.946698
			],
			[
				92.92074199999999,
				55.948552
			],
			[
				92.912598,
				55.952233
			],
			[
				92.910929,
				55.951539999999994
			],
			[
				92.907671,
				55.951966999999996
			],
			[
				92.900414,
				55.951451
			],
			[
				92.898709,
				55.950773
			],
			[
				92.887806,
				55.913624
			],
			[
				92.8857,
				55.911607999999994
			],
			[
				92.88006,
				55.912022
			],
			[
				92.87100799999999,
				55.916787
			],
			[
				92.871201,
				55.919205
			],
			[
				92.868726,
				55.919653999999994
			],
			[
				92.85799899999999,
				55.91505
			],
			[
				92.85324899999999,
				55.918551
			],
			[
				92.852862,
				55.922433
			],
			[
				92.850291,
				55.9261
			],
			[
				92.85152699999999,
				55.930397
			],
			[
				92.84547099999999,
				55.934315
			],
			[
				92.842883,
				55.939595999999995
			],
			[
				92.837505,
				55.941497999999996
			],
			[
				92.83521499999999,
				55.941494999999996
			],
			[
				92.83520399999999,
				55.941916
			],
			[
				92.837126,
				55.941941
			],
			[
				92.836877,
				55.944585
			],
			[
				92.812159,
				55.949701
			],
			[
				92.80681799999999,
				55.951826999999994
			],
			[
				92.792901,
				55.952031999999996
			],
			[
				92.786227,
				55.950058999999996
			],
			[
				92.781857,
				55.947934999999994
			],
			[
				92.781217,
				55.948164999999996
			],
			[
				92.784745,
				55.951673
			],
			[
				92.758602,
				55.95178
			],
			[
				92.682688,
				55.956604999999996
			],
			[
				92.677165,
				55.956202
			],
			[
				92.67419,
				55.954657
			],
			[
				92.67504799999999,
				55.958714
			],
			[
				92.6789,
				55.962381
			],
			[
				92.679802,
				55.964343
			],
			[
				92.679093,
				55.964234999999995
			],
			[
				92.678553,
				55.966255
			],
			[
				92.66424099999999,
				55.97226
			],
			[
				92.638706,
				55.968782
			],
			[
				92.635938,
				55.969058999999994
			],
			[
				92.63568,
				55.968132
			],
			[
				92.632054,
				55.967687
			],
			[
				92.628771,
				55.967855
			],
			[
				92.626488,
				55.970884999999996
			]
		]
	]
};
var krsk = {
	type: type,
	properties: properties,
	geometry: geometry
};

var krskMask = /*#__PURE__*/Object.freeze({
    __proto__: null,
    type: type,
    properties: properties,
    geometry: geometry,
    'default': krsk
});

CreateDiv();
/* Карта */
let ctrlDown = false;
let turn = [];
let container = document.getElementById('popup');
let content = document.getElementById('popup-content');
/* Прекрасный способ отображения popup */
let overlay = new ol.Overlay({
    element: container,
    autoPan: true,
    autoPanAnimation: {
        duration: 1
    }
});
/* Подложка */
let grayOsmLayer = new ol.layer.Tile({
    source: new ol.source.XYZ({
        url: 'https://tiles.wmflabs.org/bw-mapnik/{z}/{x}/{y}.png'
    }),
});
/* Настройки карты */
let map = new ol.Map({
    target: 'map',
    overlays: [overlay],
    controls: ol.control.defaults({
        attribution: false,
        zoom: false,
    }),
    layers: [
        grayOsmLayer
    ],
    view: new ol.View({
        center: ol.proj.transform([92.865433, 56.029337], 'EPSG:4326', 'EPSG:3857'),
        zoom: 11,
        minZoom: 10.5,
        maxZoom: 13
    })
});

let target = map.getTarget();
let jTarget = typeof target === "string" ? $("#" + target) : $(target);

map.on('pointermove', function (evt) {
    var feature = map.forEachFeatureAtPixel(evt.pixel,
        function (feature) {
            return feature;
        });
    if (feature) {
        if (feature.values_.type == 'monitoring post') {
            jTarget.css("cursor", "pointer");
            var coordinate = evt.coordinate;
            var name = feature.values_.name;
            content.innerHTML = name;
            overlay.setPosition(coordinate);
            jTarget.css("cursor", "pointer");
        }
        else {
            overlay.setPosition(undefined);
            jTarget.css("cursor", "context-menu");
            return false;
        }
    } else {
        overlay.setPosition(undefined);
        jTarget.css("cursor", "context-menu");
        return false;

    }
});

map.on('click', function (evt) {
    var feature = map.forEachFeatureAtPixel(evt.pixel,
        function (feature) {
            return feature;
        });
    if (feature) {
        if (feature.values_.type == 'monitoring post') {
            if (ctrlDown == true) {

                turn.push(
                    {
                        id: feature.values_.id,
                        name: feature.values_.name,
                        project: feature.values_.project
                    }
                );
            }

            if (ctrlDown == false) {
                if ($('#collapseChartOne')[0].className.indexOf('show') == -1 && $('#collapseChartTwo')[0].className.indexOf('show') == -1) {
                    CloseOpenChart();
                    $('#collapseChartOne').collapse('show');
                }
                let legend = d3.select('#chart svg').selectAll('g.nv-series');
                if (legend[0].length != 0) {
                    for (let i = 0; i < legend["0"].parentNode.__data__.length; i++) {
                        if (legend["0"][i].__data__.key == feature.values_.name && legend["0"][i].style) {
                            legend["0"][i].__data__.disabled = false;
                            for (let j = 0; j < legend["0"].parentNode.__data__.length; j++) {
                                if (j != i) {
                                    legend["0"][j].__data__.disabled = true;
                                }
                            }
                        }
                    }
                    nv.utils.windowResize(MainChart.update());
                }
            }
            return feature;
        }
    }
    else {
        overlay.setPosition(undefined);
    }
});

/* Popup */
function CreateDiv() {
    let div = document.createElement("div");
    div.className = "ol-popup";
    div.id = "popup";
    document.body.appendChild(div);
    let divcontent = document.createElement("div");
    divcontent.id = "popup-content";
    document.getElementById("popup").appendChild(divcontent);
    document.getElementById("popup").innerHTML += '<svg></svg>';
}
async function LayerUpdate(data, attribution) {
    const id = attribution.layerID ? attribution.layerID : attribution.indicator_id[0];
    const range = GetRange(id);
    const dots = [];
    let remove = [];
    map.getLayers().forEach(function (layer) {
        if (layer.values_.name != 'Wind')
            remove.push(layer);
    });
    for (let i = 1, len = remove.length; i < len; i++)
        map.removeLayer(remove[i]);

    let iconFeatures = [];
    for (let i = 0; i < data.length; i++) {
        if (data[i].name != undefined) {
            let x = +data[i].x;
            let y = +data[i].y;
            let color = GetColorScheme('dots', id, range, data[i].value.toFixed(4));
            let text = `${data[i].value.toFixed(1)}`;
            if (id == 348) {
                color = GetColorScheme('dots', id, range, (data[i].value * 1000).toFixed(1));
                text = `${(data[i].value * 1000).toFixed(1)}`;
            }
            const svg = '<svg width="120" height="120" version="1.1" xmlns="http://www.w3.org/2000/svg">'
                + '<circle cx="60" cy="30" r="30" stroke-width="1" stroke="' + color + '" fill="' + color + '"/>'
                + '<circle cx="60" cy="30" r="20" stroke-width="1" stroke="white" fill="white"/>'
                + '<polygon points="45,55 75,55 60,70" fill="' + color + '" stroke="' + color + '" stroke-width="5" />'
                + '</svg>';

            iconFeatures.push(new ol.Feature({
                name: data[i].name,
                id: data[i].id,
                project: data[i].project,
                value: data[i].value,
                type: 'monitoring post',
                typeChartMode: (attribution.indicator_id.length == 1) ? 0 : 1,
                geometry: new ol.geom.Point(ol.proj.transform([x, y], 'EPSG:4326',
                    'EPSG:3857')),
            }));

            iconFeatures[i].setStyle(new ol.style.Style({
                image: new ol.style.Icon(({
                    opacity: 1,
                    src: 'data:image/svg+xml;utf8,' + svg,
                    scale: 0.65,
                    color: color
                })),
                text: new ol.style.Text({
                    font: 'bold 12px arial',
                    text: text,
                    offsetY: -18,
                    fill: new ol.style.Fill({ color: 'white', width: 2 }),
                })
            }));
            if (id == 348) {
                dots.push([+y, +x, +(data[i].value * 1000).toFixed(1)]);
            }
            else {
                dots.push([+y, +x, +(data[i].value).toFixed(4)]);
            }

        }
    }
    let vectorSource = new ol.source.Vector({
        features: iconFeatures,
    });

    let vectorLayer = new ol.layer.Vector({
        source: vectorSource,
        zIndex: 1
    });

    map.addLayer(vectorLayer);

    const isolines = document.getElementById('AirIsolines').checked;
    if (isolines) {
        let vectorLayerPoligons = await Isolines(dots, RangeConversionMainPoint(range, 0), attribution);
        map.addLayer(vectorLayerPoligons);
    }
}
async function LayerUpdateWind(speed, direction) {
    let remove = [];
    map.getLayers().forEach(function (layer) {
        if (layer.values_.name == 'Wind')
            remove.push(layer);
    });
    for (let i = 0, len = remove.length; i < len; i++)
        map.removeLayer(remove[i]);

    const checked = document.getElementById('AirWind').checked;

    if (checked) {
        let iconFeatures = [];
        const id = 102;
        const range = [0, 0.5, 2, 4, 6, 20];
        for (let i = 0; i < speed.length; i++) {
            let x = +speed[i].x;
            let y = +speed[i].y;
            let color = GetColorScheme('dots', id, range, speed[i].value.toFixed(0));
            let text = `${speed[i].value.toFixed(0)}`;

            const svg = '<svg width="120" height="120" version="1.1" xmlns="http://www.w3.org/2000/svg">'
                + '<circle cx="60" cy="60" r="30" stroke-width="1" stroke="' + color + '" fill="' + color + '"/>'
                + '<circle cx="60" cy="60" r="20" stroke-width="1" stroke="white" fill="white"/>'
                + '<polygon points="45,86 75,86 60,105" fill="' + color + '" stroke="' + color + '" stroke-width="5" style="transform: rotate(' + direction[i].value + 'deg);transform-origin: 50% 50%;" />'
                + '</svg>';

            iconFeatures.push(new ol.Feature({
                name: speed[i].name,
                id: speed[i].id,
                project: speed[i].project,
                value: speed[i].value,
                type: 'wind post',
                geometry: new ol.geom.Point(ol.proj.transform([x, y], 'EPSG:4326',
                    'EPSG:3857')),
            }));
            iconFeatures[i].setStyle(new ol.style.Style({
                image: new ol.style.Icon(({
                    opacity: 1,
                    src: 'data:image/svg+xml;utf8,' + svg,
                    scale: 0.65,
                    color: color
                })),
                text: new ol.style.Text({
                    font: 'bold 12px arial',
                    text: text,
                    offsetY: 0,
                    fill: new ol.style.Fill({ color: 'black', width: 2 }),
                })
            }));
        }        let vectorSource = new ol.source.Vector({
            features: iconFeatures,
        });

        let vectorLayer = new ol.layer.Vector({
            source: vectorSource,
            name: 'Wind',
            zIndex: 2
        });

        map.addLayer(vectorLayer);
    }
}

async function Isolines(dots, range, attribution) {
    const indicator_id = attribution.layerID ? attribution.layerID : attribution.indicator_id[0];
    const rangeForColor = RangeConversion(range);
    const barrier = document.getElementById('AirBarriers').checked;
    const colorGradient = GenerateColorMainPoint(GetColorScheme(0, indicator_id), 0);
    let poligons;
    if (barrier) {
        const mask = dline.ascToArray(await fetch('krs_cut.asc').then(res => res.text()));
        poligons = dline.isobands(dline.IDW(dots, 250, { bbox: [20, 20], units: ['meters', 'degrees'], mask, boundaries: [[+50, +0.2], [+100, +0.1]], exponent: 3 }), range);
    }
    else {

        poligons = dline.voronoi(dots, [92.25, 55.8, 93.4, 56.2], krskMask);

        const totalPollutionLevel = dline.getTotalLevel(poligons);

        document.querySelector('#totalPollutionLevel').innerHTML = totalPollutionLevel.toFixed();
    }
    let opacity = document.getElementById("opacityLayersChange").value;

    let vectorSourceP = new ol.source.Vector({
        features: (new ol.format.GeoJSON({
            featureProjection: 'EPSG:3857',
            dataProjection: 'EPSG:4326'
        })).readFeatures(poligons)
    });

    let vectorLayerP = new ol.layer.Vector({
        source: vectorSourceP,
        opacity: opacity
    });

    vectorLayerP.set('name', 'polygons');
    vectorLayerP.setStyle(function (i) {

        const color = GetColorForVoronoi(colorGradient, rangeForColor, i.values_.value);
        return new ol.style.Style({
            fill: new ol.style.Fill({ color: color }),
            stroke: new ol.style.Stroke({ width: 1, color: 'black' }),
        });
    });
    return vectorLayerP;
}
document.addEventListener('keydown', e => {
    if (e.repeat == false && e.key == 'Control') {
        turn = [];
        ctrlDown = true;
    }
});

document.addEventListener('keyup', e => {
    if (e.repeat == false && e.key == 'Control') {
        ctrlDown = false;
        DownLoadMultiIndicator(turn).then(e => {
            if (e.length != 0) {
                RefreshAdditionalChart(e, AdditionalChart);
                const buttonOpen = document.getElementById('CloseOpenChartButton');
                if (buttonOpen.innerText == 'Открыть график') {
                    CloseOpenChart();
                }
                $('#collapseChartOne').collapse('hide');
                $('#collapseChartTwo').collapse('show');
            }
        });
    }
});

FillDate();
DownloadSitesList();
let DownloadedData;
let DownloadedWind;
let a = DownloadSitesList();
let attribution;
UpdateInterface();
async function UpdateInterface() {
    attribution = GetAttributes();
    const Time = GetTime(attribution.day_one, attribution.day_two, attribution.interval);
    let SitesList = await a;
    DownloadedData = (attribution.Station_List_Id == 0) ? await Download(Time, attribution) : await DownloadIndividual(Time, attribution, SitesList);
    DownloadedWind = await DownloadWind(Time, attribution);
    const DataPerHourWindSpeed = FindData(DownloadedWind.WindSpeed, Time[0]);
    const DataPerHourWindDirection = FindData(DownloadedWind.WindDirection, Time[0]);
    const DataPerHourWind = FindData(DownloadedData.WindSpeed, Time[0]);
    const DataPerHourLayer = FindData(DownloadedData.DataForLayer, Time[0]);
    const DataPerHourDirection = FindData(DownloadedData.WindDirection, Time[0]);
    /* Обновление */
    LayerUpdate(AddName(DataPerHourLayer, DownloadedData.DataSites), attribution);
    LayerUpdateWind(AddName(DataPerHourWindSpeed, DownloadedWind.SitesSet), AddName(DataPerHourWindDirection, DownloadedWind.SitesSet));
    PushTimeInSlide(Time);
    RefreshChart(DownloadedData.DataForGraph, MainChart);
    /*     RefreshAdditionalChart([], AdditionalChart); */
    ChangeWindSpeed(DataPerHourWind);
    ChangeDirectionArrow(DataPerHourDirection);
    LegendFormation(attribution.layerID ? attribution.layerID : attribution.indicator_id);
    document.getElementById('timedisplay').innerHTML = Time[0];
}
$('.refresh').on('click', function () {
    UpdateInterface();
});

$('#range_footer').on('input', function () {
    let Time = this.list.children[this.value].innerHTML;
    document.getElementById('timedisplay').innerHTML = Time;
    const DataPerHourWind = FindData(DownloadedData.WindSpeed, Time);
    const DataPerHourLayer = FindData(DownloadedData.DataForLayer, Time);
    const DataPerHourDirection = FindData(DownloadedData.WindDirection, Time);
    const DataPerHourWindSpeed = FindData(DownloadedWind.WindSpeed, Time);
    const DataPerHourWindDirection = FindData(DownloadedWind.WindDirection, Time);
    LayerUpdate(AddName(DataPerHourLayer, DownloadedData.DataSites), attribution);
    LayerUpdateWind(AddName(DataPerHourWindSpeed, DownloadedWind.SitesSet), AddName(DataPerHourWindDirection, DownloadedWind.SitesSet));
    ChangeWindSpeed(DataPerHourWind);
    ChangeDirectionArrow(DataPerHourDirection);
});

$('#collapseChartOne').on('shown.bs.collapse', function () {
    try {
        MainChart.update();
    }
    catch (e) {
        console.log('График не загружен');
    }
});

$('#collapseChartTwo').on('shown.bs.collapse', function () {
    try {
        AdditionalChart.update();
    }
    catch (e) {
        console.log('График не загружен');
    }
});

$('#CloseOpenChartButton').on('click', function () {
    CloseOpenChart();
});

$('#button_selection_station').on('click', function () {
    const radioList = document.getElementsByClassName('radio2');
    for (let i = 0; i < radioList.length; i++) {
        if (radioList[i].id == 'AirRadioComparison');
        {
            radioList[i].checked = true;
        }
    }
});

$('.airCardItem').on('click', function (e) {
    if (e.target.localName == 'label') {
        const listRadio = document.getElementsByClassName('radio');
        const checkedElement = e.target.parentNode.firstChild;
        for (let i = 0; i < listRadio.length; i++) {
            if (listRadio[i] != checkedElement && checkedElement.className == 'radio') {
                listRadio[i].checked = false;
                checkedElement.checked = false;
            }
        }
    }
});

$('#chart').on('click', function () {
    const tooltipAll = document.getElementsByClassName('nvtooltip xy-tooltip');
    const tooltip = tooltipAll[0];
    if (tooltip.style.opacity == 1) {
        let x_value = document.getElementsByClassName('x-value')[0];
        let Time = x_value.innerHTML;
        let range = document.getElementById('range_footer');
        let datalist = document.getElementById('tickmarks');
        for (let i = 0; i < datalist.children.length; i++) {
            if (Time == datalist.children[i].innerHTML) {
                range.value = i;
            }
        }
        document.getElementById('timedisplay').innerHTML = Time;
        const DataPerHourWind = FindData(DownloadedData.WindSpeed, Time);
        const DataPerHourLayer = FindData(DownloadedData.DataForLayer, Time);
        const DataPerHourDirection = FindData(DownloadedData.WindDirection, Time);
        LayerUpdate(AddName(DataPerHourLayer, DownloadedData.DataSites), attribution);
        ChangeWindSpeed(DataPerHourWind);
        ChangeDirectionArrow(DataPerHourDirection);
    }
});

$('#chart2').on('click', function () {
    const tooltipAll = document.getElementsByClassName('nvtooltip xy-tooltip');
    const tooltip = tooltipAll[1];
    if (tooltip != undefined)
        if (tooltip.style.opacity == 1) {
            let x_value = document.getElementsByClassName('x-value')[1];
            let Time = x_value.innerHTML;
            let range = document.getElementById('range_footer');
            let datalist = document.getElementById('tickmarks');
            for (let i = 0; i < datalist.children.length; i++) {
                if (Time == datalist.children[i].innerHTML) {
                    range.value = i;
                }
            }
            document.getElementById('timedisplay').innerHTML = Time;
            const DataPerHourWind = FindData(DownloadedData.WindSpeed, Time);
            const DataPerHourLayer = FindData(DownloadedData.DataForLayer, Time);
            const DataPerHourDirection = FindData(DownloadedData.WindDirection, Time);
            LayerUpdate(AddName(DataPerHourLayer, DownloadedData.DataSites), attribution);
            ChangeWindSpeed(DataPerHourWind);
            ChangeDirectionArrow(DataPerHourDirection);
        }
});

$('#AirIsolines').on('change', function () {

    let Time = document.getElementById('timedisplay').innerHTML;
    const DataPerHourLayer = FindData(DownloadedData.DataForLayer, Time);
    LayerUpdate(AddName(DataPerHourLayer, DownloadedData.DataSites), attribution);

});

$('#AirBarriers').on('change', function () {

    let Time = document.getElementById('timedisplay').innerHTML;
    const DataPerHourLayer = FindData(DownloadedData.DataForLayer, Time);
    LayerUpdate(AddName(DataPerHourLayer, DownloadedData.DataSites), attribution);

});

$('#removeSelectionButton').on('click', function () {
    let Station_List = document.getElementsByClassName('AirStationListItem');
    for (let i = 0; i < Station_List.length; i++) {
        Station_List[i].checked = false;
    }
});

$('#putSelectionButton').on('click', function () {
    let Station_List = document.getElementsByClassName('AirStationListItem');
    for (let i = 0; i < Station_List.length; i++) {
        Station_List[i].checked = true;
    }
});

$('#AirWind').on('change', function () {
    let Time = document.getElementById('timedisplay').innerHTML;
    const DataPerHourLayer = FindData(DownloadedData.DataForLayer, Time);
    const DataPerHourWindSpeed = FindData(DownloadedWind.WindSpeed, Time);
    const DataPerHourWindDirection = FindData(DownloadedWind.WindDirection, Time);
    LayerUpdate(AddName(DataPerHourLayer, DownloadedData.DataSites), attribution);
    LayerUpdateWind(AddName(DataPerHourWindSpeed, DownloadedWind.SitesSet), AddName(DataPerHourWindDirection, DownloadedWind.SitesSet));
});

$('.radio').on('change', function () {
    document.getElementById('airChangeLayer').innerHTML = ``;
    const listRadio = document.getElementsByClassName('radio');
    for (let i = 0; i < listRadio.length; i++) {
        if (listRadio[i].checked == true) {
            document.getElementById('airChangeLayer').innerHTML += `<option value="${listRadio[i].id}">${listRadio[i].name}</option>`;
        }
    }
});


window.onresize = function () {
    try {
        MainChart.update();
    }
    catch (e) {

    }
    try {
        AdditionalChart.update();
    }
    catch (e) {

    }
};
