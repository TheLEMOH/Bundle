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
    const My_Datepicker_value = document.getElementById('day').value.replace(/\s+/g, '');
    let day_one = 0;
    let day_two = 0;
    if (My_Datepicker_value) {
        if (My_Datepicker_value.split(",").length > 1) {
            const My_Datepicker_value_split = My_Datepicker_value.split(",");
            const My_Datepicker_value_split_day_one = My_Datepicker_value_split[0].split(".");
            const My_Datepicker_value_split_day_two = My_Datepicker_value_split[1].split(".");
            day_one = formatDate(new Date(My_Datepicker_value_split_day_one[2], My_Datepicker_value_split_day_one[1] - 1, My_Datepicker_value_split_day_one[0]));
            day_two = formatDate(new Date(My_Datepicker_value_split_day_two[2], My_Datepicker_value_split_day_two[1] - 1, My_Datepicker_value_split_day_two[0]));
        }
        else {
            const My_Datepicker_value_split = My_Datepicker_value.split(".");
            day_one = formatDate(new Date(My_Datepicker_value_split[2], My_Datepicker_value_split[1] - 1, 1));
            day_two = formatDate(new Date(My_Datepicker_value_split[2], My_Datepicker_value_split[1], 0));
        }
    }
    else {
        day_one = formatDate(new Date());
        day_two = formatDate(new Date());
    }
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
function GetColorForPoligon(colorScheme, range, value) {
    for (let i = 0; i < range.length; i++) {
        if (value == range[i]) {
            return colorScheme[i];
        }    }
}
async function ChangeWindSpeed(data) {
    document.getElementById("windspeed").innerText = Math.trunc(data) + ' м/с';
}
async function ChangeDirectionArrow(data) {
    document.getElementById("Direction_Arrow").style = "transform: rotate(" + data + "deg);";
}

async function Download(Time, attribution) {
  const layerID = attribution.layerID != 0 ? attribution.layerID : attribution.indicator_id[0];
  const key = "654hblgm9gl8367h";
  const url_data =
    "https://sensor.krasn.ru/sc/api/1.0/projects/" +
    attribution.station_id +
    "/aggvalues?key=" +
    key +
    "&time_begin=" +
    attribution.day_one +
    "&time_end=" +
    attribution.day_two +
    "&indicators=" +
    layerID +
    "&time_interval=" +
    attribution.interval +
    "&limit=300000";
  const url_sets =
    "https://sensor.krasn.ru/sc/api/1.0/projects/" +
    attribution.station_id +
    "/sites?key=" +
    key +
    "&time_begin=" +
    attribution.day_one +
    "&time_end=" +
    attribution.day_two +
    "&indicators=" +
    layerID +
    "";
  const url_wind_dir =
    "https://sensor.krasn.ru/sc/api/1.0/projects/1/aggvalues?sites=3833&key=" +
    key +
    "&time_begin=" +
    attribution.day_one +
    "&time_end=" +
    attribution.day_two +
    "&indicators=101&time_interval=" +
    attribution.interval +
    "&limit=30000";
  const url_wind_speed =
    "https://sensor.krasn.ru/sc/api/1.0/projects/1/aggvalues?sites=3833&key=" +
    key +
    "&time_begin=" +
    attribution.day_one +
    "&time_end=" +
    attribution.day_two +
    "&indicators=102&time_interval=" +
    attribution.interval +
    "&limit=30000";
  const RawData = fetch(url_data);
  const RawDataSites = fetch(url_sets);
  const RawWindSpeed = fetch(url_wind_speed);
  const RawWindDirection = fetch(url_wind_dir);
  const DataSites = await RawDataSites.then((res) => res.text())
    .then((res) => ParseText(res))
    .then((res) => ParseXMLSites(res));
  const Data = await RawData.then((res) => res.text()).then((res) => ParseText(res));
  let WindSpeed = await RawWindSpeed.then((res) => res.text()).then((res) => ParseText(res));
  let WindDirection = await RawWindDirection.then((res) => res.text()).then((res) => ParseText(res));
  const DataForGraph = ParseXMLDataForGraph(Data, DataSites, layerID);
  const DataForLayer = ParseXMLDataForLayer(Data, Time, attribution.station_id);
  WindSpeed = ParseXMLOne(WindSpeed);
  WindDirection = ParseXMLOne(WindDirection);
  return {
    DataSites,
    DataForGraph: await DataForGraph,
    DataForLayer: await DataForLayer,
    WindSpeed: await WindSpeed,
    WindDirection: await WindDirection,
  };
}

async function DownloadIndividual(Time, attribution, SitesList) {
  const key = "654hblgm9gl8367h";
  const url_wind_dir =
    "https://sensor.krasn.ru/sc/api/1.0/projects/1/aggvalues?sites=3833&key=" +
    key +
    "&time_begin=" +
    attribution.day_one +
    "&time_end=" +
    attribution.day_two +
    "&indicators=101&time_interval=" +
    attribution.interval +
    "&limit=30000";
  const url_wind_speed =
    "https://sensor.krasn.ru/sc/api/1.0/projects/1/aggvalues?sites=3833&key=" +
    key +
    "&time_begin=" +
    attribution.day_one +
    "&time_end=" +
    attribution.day_two +
    "&indicators=102&time_interval=" +
    attribution.interval +
    "&limit=30000";
  const RawWindSpeed = fetch(url_wind_speed);
  const RawWindDirection = fetch(url_wind_dir);
  const ListStation = attribution.Station_List_Id;
  let DataForGraph = [];
  let DataForLayer = Time.map((e) => {
    return {
      time: e,
      values: [],
    };
  });
  for (let i = 0; i < ListStation.length; i++) {
    for (let j = 0; j < ListStation[i].length; j++) {
      const layerID = attribution.layerID != 0 ? attribution.layerID : attribution.indicator_id[0];
      const url_dataset =
        "https://sensor.krasn.ru/sc/api/1.0/projects/" +
        ListStation[i][j].project +
        "/aggvalues?sites=" +
        ListStation[i][j].id +
        "& key=paaqyrklx1d1ehik&time_begin=" +
        attribution.day_one +
        "&time_end=" +
        attribution.day_two +
        "&indicators=" +
        layerID +
        "&time_interval=" +
        attribution.interval +
        "&limit=300000";
      const RawData = fetch(url_dataset);
      const Data = await RawData.then((res) => res.text()).then((res) => ParseText(res));
      const Graph = ParseXMLDataForGraph(Data, SitesList, layerID);
      const Layer = await ParseXMLDataForLayer(Data, Time, ListStation[i][j].project);
      for (let k = 0; k < Layer.length; k++) {
        for (let q = 0; q < DataForLayer.length; q++) {
          if (Layer[k].time == DataForLayer[q].time) {
            DataForLayer[q].values.push(...Layer[k].values);
          }
        }
      }

      DataForGraph.push(...(await Graph));
    }
  }
  let WindSpeed = await RawWindSpeed.then((res) => res.text()).then((res) => ParseText(res));
  let WindDirection = await RawWindDirection.then((res) => res.text()).then((res) => ParseText(res));
  WindSpeed = ParseXMLOne(WindSpeed);
  WindDirection = ParseXMLOne(WindDirection);
  return {
    DataForGraph,
    DataForLayer,
    DataSites: SitesList,
    WindSpeed: await WindSpeed,
    WindDirection: await WindDirection,
  };
}

async function DownloadSitesList() {
  let attribution = GetAttributes();
  const key = "654hblgm9gl8367h";
  const SitesFullList = [];
  const url_stationset_regionl =
    "https://sensor.krasn.ru/sc/api/1.0/projects/1/sites?key=" +
    key +
    "&&time_begin=" +
    attribution.day_one +
    "&time_end=" +
    attribution.day_two +
    "&indicators=" +
    attribution.indicator_id[0] +
    "";
  const url_stationset_knc =
    "https://sensor.krasn.ru/sc/api/1.0/projects/9/sites?key=" +
    key +
    "&&time_begin=" +
    attribution.day_one +
    "&time_end=" +
    attribution.day_two +
    "&indicators=" +
    attribution.indicator_id[0] +
    "";
  const url_stationset_nebo =
    "https://sensor.krasn.ru/sc/api/1.0/projects/8/sites?key=" +
    key +
    "&&time_begin=" +
    attribution.day_one +
    "&time_end=" +
    attribution.day_two +
    "&indicators=" +
    attribution.indicator_id[0] +
    "";

  let Sites_Set_Regional = fetch(url_stationset_regionl);
  let Sites_Set_KNC = fetch(url_stationset_knc);
  let Sites_Set_Nebo = fetch(url_stationset_nebo);

  Sites_Set_Regional = await Sites_Set_Regional.then((res) => res.text());
  Sites_Set_Regional = ParseText(Sites_Set_Regional);
  Sites_Set_Regional = ParseXMLSites(Sites_Set_Regional);

  Sites_Set_KNC = await Sites_Set_KNC.then((res) => res.text());
  Sites_Set_KNC = ParseText(Sites_Set_KNC);
  Sites_Set_KNC = ParseXMLSites(Sites_Set_KNC);

  Sites_Set_Nebo = await Sites_Set_Nebo.then((res) => res.text());
  Sites_Set_Nebo = ParseText(Sites_Set_Nebo);
  Sites_Set_Nebo = ParseXMLSites(Sites_Set_Nebo);

  document.getElementsByClassName("AirStationContent")[0].innerHTML = "";
  document.getElementsByClassName("AirStationContent")[1].innerHTML = "";
  document.getElementsByClassName("AirStationContent")[2].innerHTML = "";

  for (let i = 0; i < Sites_Set_Regional.length; i++) {
    document.getElementsByClassName(
      "AirStationContent"
    )[0].innerHTML += `<div><input type="checkbox" class="AirStationListItem" id="AirStation_${Sites_Set_Regional[i].id}" value="1"></input><label for="AirStation_${Sites_Set_Regional[i].id}">${Sites_Set_Regional[i].name}</label></div>`;
  }
  for (let i = 0; i < Sites_Set_KNC.length; i++) {
    document.getElementsByClassName(
      "AirStationContent"
    )[1].innerHTML += `<div><input type="checkbox" class="AirStationListItem" id="AirStation_${Sites_Set_KNC[i].id}" value="9"></input><label for="AirStation_${Sites_Set_KNC[i].id}">${Sites_Set_KNC[i].name}</label></div>`;
  }
  for (let i = 0; i < Sites_Set_Nebo.length; i++) {
    document.getElementsByClassName(
      "AirStationContent"
    )[2].innerHTML += `<div><input type="checkbox" class="AirStationListItem" id="AirStation_${Sites_Set_Nebo[i].id}" value="8"></input><label for="AirStation_${Sites_Set_Nebo[i].id}">${Sites_Set_Nebo[i].name}</label></div>`;
  }

  SitesFullList.push(...Sites_Set_Regional);
  SitesFullList.push(...Sites_Set_KNC);
  SitesFullList.push(...Sites_Set_Nebo);

  return SitesFullList;
}

async function DownloadWind(Time, attribution) {
  /* Ссылки */
  const key = "654hblgm9gl8367h";
  const url_wind_dir =
    "https://sensor.krasn.ru/sc/api/1.0/projects/1/aggvalues?s&key=" +
    key +
    "&time_begin=" +
    attribution.day_one +
    "&time_end=" +
    attribution.day_two +
    "&indicators=101&time_interval=" +
    attribution.interval +
    "&limit=30000";
  const url_wind_speed =
    "https://sensor.krasn.ru/sc/api/1.0/projects/1/aggvalues?&key=" +
    key +
    "&time_begin=" +
    attribution.day_one +
    "&time_end=" +
    attribution.day_two +
    "&indicators=102&time_interval=" +
    attribution.interval +
    "&limit=30000";
  const url_wind_speed_metar =
    "https://sensor.krasn.ru/sc/api/1.0/projects/10/aggvalues?&key=" +
    key +
    "&time_begin=" +
    attribution.day_one +
    "&time_end=" +
    attribution.day_two +
    "&indicators=102&time_interval=" +
    attribution.interval +
    "&limit=30000";
  const url_wind_dir_metar =
    "https://sensor.krasn.ru/sc/api/1.0/projects/10/aggvalues?s&key=" +
    key +
    "&time_begin=" +
    attribution.day_one +
    "&time_end=" +
    attribution.day_two +
    "&indicators=101&time_interval=" +
    attribution.interval +
    "&limit=30000";
  const url_wind_speed_ugms =
    "https://sensor.krasn.ru/sc/api/1.0/projects/5/aggvalues?&key=" +
    key +
    "&time_begin=" +
    attribution.day_one +
    "&time_end=" +
    attribution.day_two +
    "&indicators=102&time_interval=" +
    attribution.interval +
    "&limit=30000";
  const url_wind_dir_ugms =
    "https://sensor.krasn.ru/sc/api/1.0/projects/5/aggvalues?s&key=" +
    key +
    "&time_begin=" +
    attribution.day_one +
    "&time_end=" +
    attribution.day_two +
    "&indicators=101&time_interval=" +
    attribution.interval +
    "&limit=30000";
  const url_stationset =
    "https://sensor.krasn.ru/sc/api/1.0/projects/1/sites?key=" + key + "&&time_begin=" + attribution.day_one + "&time_end=" + attribution.day_two + "&indicators=102";
  const url_stationset_metar =
    "https://sensor.krasn.ru/sc/api/1.0/projects/10/sites?key=" + key + "&&time_begin=" + attribution.day_one + "&time_end=" + attribution.day_two + "&indicators=102";
  const url_stationset_ugms =
    "https://sensor.krasn.ru/sc/api/1.0/projects/5/sites?key=" + key + "&&time_begin=" + attribution.day_one + "&time_end=" + attribution.day_two + "&indicators=102";

  /* Посты */
  const RawDataStations = fetch(url_stationset);
  const RawDataStationsMETAR = fetch(url_stationset_metar);
  const RawDataStationsUGMS = fetch(url_stationset_ugms);
  const SitesSet = await RawDataStations.then((res) => res.text())
    .then((res) => ParseText(res))
    .then((res) => ParseXMLSites(res));
  const SitesSetMETAR = await RawDataStationsMETAR.then((res) => res.text())
    .then((res) => ParseText(res))
    .then((res) => ParseXMLSites(res));
  const SitesSetUGMS = await RawDataStationsUGMS.then((res) => res.text())
    .then((res) => ParseText(res))
    .then((res) => ParseXMLSites(res));
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
  const WindSpeed = await RawDataWindSpeed.then((res) => res.text())
    .then((res) => ParseText(res))
    .then((res) => ParseXMLDataForLayer(res, Time, 1));
  const WindDirection = await RawDataWindDirection.then((res) => res.text())
    .then((res) => ParseText(res))
    .then((res) => ParseXMLDataForLayer(res, Time, 1));
  const WindSpeedMETAR = await RawDataWindSpeedMETAR.then((res) => res.text())
    .then((res) => ParseText(res))
    .then((res) => ParseXMLDataForLayer(res, Time, 1));
  const WindDirectionMETAR = await RawDataWindDirectionMETAR.then((res) => res.text())
    .then((res) => ParseText(res))
    .then((res) => ParseXMLDataForLayer(res, Time, 1));
  const WindSpeedUGMS = await RawDataWindSpeedUGMS.then((res) => res.text())
    .then((res) => ParseText(res))
    .then((res) => ParseXMLDataForLayer(res, Time, 1));
  const WindDirectionUGMS = await RawDataWindDirectionUGMS.then((res) => res.text())
    .then((res) => ParseText(res))
    .then((res) => ParseXMLDataForLayer(res, Time, 1));

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
    WindDirection,
  };
}

async function DownloadWindFromVantage(Time, attribution) {
  const key = "654hblgm9gl8367h";
  const url_wind_dir =
    "https://sensor.krasn.ru/sc/api/1.0/projects/6/aggvalues?s&key=" +
    key +
    "&time_begin=" +
    attribution.day_one +
    "&time_end=" +
    attribution.day_two +
    "&indicators=101&time_interval=" +
    attribution.interval +
    "&limit=30000";
  const url_wind_speed =
    "https://sensor.krasn.ru/sc/api/1.0/projects/6/aggvalues?&key=" +
    key +
    "&time_begin=" +
    attribution.day_one +
    "&time_end=" +
    attribution.day_two +
    "&indicators=102&time_interval=" +
    attribution.interval +
    "&limit=30000";
  const url_wind_rapid =
    "https://sensor.krasn.ru/sc/api/1.0/projects/6/aggvalues?&key=" +
    key +
    "&time_begin=" +
    attribution.day_one +
    "&time_end=" +
    attribution.day_two +
    "&indicators=369&time_interval=" +
    attribution.interval +
    "";

  const RawDataWindSpeed = fetch(url_wind_speed);
  const RawDataWindDirection = fetch(url_wind_dir);
  const RawDataWindRapid = fetch(url_wind_rapid);

  const WindSpeed = await RawDataWindSpeed.then((res) => res.text())
    .then((res) => ParseText(res))
    .then((res) => ParseXMLOne(res));
  const WindDirection = await RawDataWindDirection.then((res) => res.text())
    .then((res) => ParseText(res))
    .then((res) => ParseXMLOne(res));
  const WindRapid = await RawDataWindRapid.then((res) => res.text())
    .then((res) => ParseText(res))
    .then((res) => ParseXMLOne(res));

  return {
    WindSpeed,
    WindDirection,
    WindRapid,
  };
}

async function DownLoadMultiIndicator(turn) {
  const DataSet = [];
  for (let e in turn) {
    const id = turn[e].id;
    const name = turn[e].name;
    const project = turn[e].project;

    const key = "654hblgm9gl8367h";
    const attribution = GetAttributes();
    const Indicators = attribution.indicator_id;
    const IndicatorsName = attribution.indicator_name;
    const PromiseData = [];

    for (let i = 0; i < Indicators.length; i++) {
      const url_dataset =
        "https://sensor.krasn.ru/sc/api/1.0/projects/" +
        project +
        "/aggvalues?sites=" +
        id +
        "&key=" +
        key +
        "&time_begin=" +
        attribution.day_one +
        "&time_end=" +
        attribution.day_two +
        "&indicators=" +
        Indicators[i] +
        "&time_interval=" +
        attribution.interval +
        "&limit=300000";
      PromiseData.push(
        fetch(url_dataset)
          .then((res) => res.text())
          .then((res) => ParseText(res))
          .then((res) => ParseXMLOneForChart(res, Indicators[i]))
      );
    }

    for (let i = 0; i < PromiseData.length; i++) {
      const DataForInterface = await PromiseData[i];
      DataSet.push({
        key: name + " " + IndicatorsName[i],
        type: "line",
        yAxis: (i % 2) + 1,
        color: i % 2 == 0 ? "rgba(20,120,251, 1)" : "rgba(102,0,153,1)",
        values: DataForInterface,
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

CreateDiv();
/* Карта */
let ctrlDown = false;
let turn = [];
let container = document.getElementById("popup");
let content = document.getElementById("popup-content");
/* Прекрасный способ отображения popup */
let overlay = new ol.Overlay({
  element: container,
  autoPan: true,
  autoPanAnimation: {
    duration: 1,
  },
});
/* Подложка */
let grayOsmLayer = new ol.layer.Tile({
  source: new ol.source.OSM(),
});
/* Настройки карты */
let map = new ol.Map({
  target: "map",
  overlays: [overlay],
  controls: ol.control.defaults({
    attribution: false,
    zoom: false,
  }),
  layers: [grayOsmLayer],
  view: new ol.View({
    center: ol.proj.transform([92.865433, 56.029337], "EPSG:4326", "EPSG:3857"),
    zoom: 11,
    minZoom: 10.5,
    maxZoom: 13,
  }),
});

let target = map.getTarget();
let jTarget = typeof target === "string" ? $("#" + target) : $(target);

map.on("pointermove", function (evt) {
  var feature = map.forEachFeatureAtPixel(evt.pixel, function (feature) {
    return feature;
  });
  if (feature) {
    if (feature.values_.type == "monitoring post") {
      jTarget.css("cursor", "pointer");
      var coordinate = evt.coordinate;
      var name = feature.values_.name;
      content.innerHTML = name;
      overlay.setPosition(coordinate);
      jTarget.css("cursor", "pointer");
    } else {
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

map.on("click", function (evt) {
  var feature = map.forEachFeatureAtPixel(evt.pixel, function (feature) {
    return feature;
  });
  if (feature) {
    if (feature.values_.type == "monitoring post") {
      if (ctrlDown == true) {
        turn.push({
          id: feature.values_.id,
          name: feature.values_.name,
          project: feature.values_.project,
        });
      }

      if (ctrlDown == false) {
        if ($("#collapseChartOne")[0].className.indexOf("show") == -1 && $("#collapseChartTwo")[0].className.indexOf("show") == -1) {
          CloseOpenChart();
          $("#collapseChartOne").collapse("show");
        }
        let legend = d3.select("#chart svg").selectAll("g.nv-series");
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
  } else {
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
  document.getElementById("popup").innerHTML += "<svg></svg>";
}

async function LayerUpdate(data, attribution) {
  const id = attribution.layerID ? attribution.layerID : attribution.indicator_id[0];
  const range = GetRange(id);
  const dots = [];
  let remove = [];
  map.getLayers().forEach(function (layer) {
    if (layer.values_.name != "Wind") remove.push(layer);
  });
  for (let i = 1, len = remove.length; i < len; i++) map.removeLayer(remove[i]);

  let iconFeatures = [];
  for (let i = 0; i < data.length; i++) {
    if (data[i].name != undefined) {
      let x = +data[i].x;
      let y = +data[i].y;
      let color = GetColorScheme("dots", id, range, data[i].value.toFixed(4));
      let text = `${data[i].value.toFixed(1)}`;
      if (id == 348) {
        color = GetColorScheme("dots", id, range, (data[i].value * 1000).toFixed(1));
        text = `${(data[i].value * 1000).toFixed(1)}`;
      }
      const svg =
        '<svg width="120" height="120" version="1.1" xmlns="http://www.w3.org/2000/svg">' +
        '<circle cx="60" cy="30" r="30" stroke-width="1" stroke="' +
        color +
        '" fill="' +
        color +
        '"/>' +
        '<circle cx="60" cy="30" r="20" stroke-width="1" stroke="white" fill="white"/>' +
        '<polygon points="45,55 75,55 60,70" fill="' +
        color +
        '" stroke="' +
        color +
        '" stroke-width="5" />' +
        "</svg>";

      iconFeatures.push(
        new ol.Feature({
          name: data[i].name,
          id: data[i].id,
          project: data[i].project,
          value: data[i].value,
          type: "monitoring post",
          typeChartMode: attribution.indicator_id.length == 1 ? 0 : 1,
          geometry: new ol.geom.Point(ol.proj.transform([x, y], "EPSG:4326", "EPSG:3857")),
        })
      );

      iconFeatures[i].setStyle(
        new ol.style.Style({
          image: new ol.style.Icon({
            opacity: 1,
            src: "data:image/svg+xml;utf8," + svg,
            scale: 0.65,
            color: color,
          }),
          text: new ol.style.Text({
            font: "bold 12px arial",
            text: text,
            offsetY: -18,
            fill: new ol.style.Fill({ color: "white", width: 2 }),
          }),
        })
      );
      if (id == 348) {
        dots.push([+y, +x, +(data[i].value * 1000).toFixed(1)]);
      } else {
        dots.push([+y, +x, +data[i].value.toFixed(4)]);
      }
    }
  }

  let vectorSource = new ol.source.Vector({
    features: iconFeatures,
  });

  let vectorLayer = new ol.layer.Vector({
    source: vectorSource,
    zIndex: 1,
  });

  map.addLayer(vectorLayer);

  const isolines = document.getElementById("AirIsolines").checked;
  if (isolines) {
    let vectorLayerPoligons = await Isolines(dots, RangeConversionMainPoint(range, 0), attribution);
    map.addLayer(vectorLayerPoligons);
  }
}

async function LayerUpdateWind(speed, direction) {
  let remove = [];
  map.getLayers().forEach(function (layer) {
    if (layer.values_.name == "Wind") remove.push(layer);
  });
  for (let i = 0, len = remove.length; i < len; i++) map.removeLayer(remove[i]);

  const checked = document.getElementById("AirWind").checked;

  if (checked) {
    let iconFeatures = [];
    const id = 102;
    const range = [0, 0.5, 2, 4, 6, 20];
    for (let i = 0; i < speed.length; i++) {
      let x = +speed[i].x;
      let y = +speed[i].y;
      let color = GetColorScheme("dots", id, range, speed[i].value.toFixed(0));
      let text = `${speed[i].value.toFixed(0)}`;

      const svg =
        '<svg width="120" height="120" version="1.1" xmlns="http://www.w3.org/2000/svg">' +
        '<circle cx="60" cy="60" r="30" stroke-width="1" stroke="' +
        color +
        '" fill="' +
        color +
        '"/>' +
        '<circle cx="60" cy="60" r="20" stroke-width="1" stroke="white" fill="white"/>' +
        '<polygon points="45,86 75,86 60,105" fill="' +
        color +
        '" stroke="' +
        color +
        '" stroke-width="5" style="transform: rotate(' +
        direction[i].value +
        'deg);transform-origin: 50% 50%;" />' +
        "</svg>";

      iconFeatures.push(
        new ol.Feature({
          name: speed[i].name,
          id: speed[i].id,
          project: speed[i].project,
          value: speed[i].value,
          type: "wind post",
          geometry: new ol.geom.Point(ol.proj.transform([x, y], "EPSG:4326", "EPSG:3857")),
        })
      );
      iconFeatures[i].setStyle(
        new ol.style.Style({
          image: new ol.style.Icon({
            opacity: 1,
            src: "data:image/svg+xml;utf8," + svg,
            scale: 0.65,
            color: color,
          }),
          text: new ol.style.Text({
            font: "bold 12px arial",
            text: text,
            offsetY: 0,
            fill: new ol.style.Fill({ color: "black", width: 2 }),
          }),
        })
      );
    }
    let vectorSource = new ol.source.Vector({
      features: iconFeatures,
    });

    let vectorLayer = new ol.layer.Vector({
      source: vectorSource,
      name: "Wind",
      zIndex: 2,
    });

    map.addLayer(vectorLayer);
  }
}

async function Isolines(dots, range, attribution) {
  const indicator_id = attribution.layerID ? attribution.layerID : attribution.indicator_id[0];
  const rangeForColor = RangeConversion(range);
  const barrier = document.getElementById("AirBarriers").checked;
  const colorGradient = GenerateColorMainPoint(GetColorScheme(0, indicator_id), 0);
  let poligons;
  if (barrier) {
    const mask = dline.ascToArray(await fetch("krs_cut.asc").then((res) => res.text()));
    poligons = dline.isobands(
      dline.IDW(dots, 250, {
        bbox: [20, 20],
        units: ["meters", "degrees"],
        mask,
        boundaries: [
          [+50, +0.2],
          [+100, +0.1],
        ],
        exponent: 3,
      }),
      range
    );
  } else {
    poligons = dline.isobands(dline.IDW(dots, 250, { bbox: [200, 200], units: ["meters", "degrees"], exponent: 4 }), range);
  }
  let opacity = document.getElementById("opacityLayersChange").value;

  let vectorSourceP = new ol.source.Vector({
    features: new ol.format.GeoJSON({
      featureProjection: "EPSG:3857",
      dataProjection: "EPSG:4326",
    }).readFeatures(poligons),
  });

  let vectorLayerP = new ol.layer.Vector({
    source: vectorSourceP,
    opacity: opacity,
  });

  vectorLayerP.set("name", "polygons");
  vectorLayerP.setStyle(function (i) {
    const color = GetColorForPoligon(colorGradient, rangeForColor, i.values_.value);
    return new ol.style.Style({
      fill: new ol.style.Fill({ color: color }),
      stroke: new ol.style.Stroke({ width: 0, color: color }),
    });
  });
  return vectorLayerP;
}

document.addEventListener("keydown", (e) => {
  if (e.repeat == false && e.key == "Control") {
    turn = [];
    ctrlDown = true;
  }
});

document.addEventListener("keyup", (e) => {
  if (e.repeat == false && e.key == "Control") {
    ctrlDown = false;
    DownLoadMultiIndicator(turn).then((e) => {
      if (e.length != 0) {
        RefreshAdditionalChart(e, AdditionalChart);
        const buttonOpen = document.getElementById("CloseOpenChartButton");
        if (buttonOpen.innerText == "Открыть график") {
          CloseOpenChart();
        }
        $("#collapseChartOne").collapse("hide");
        $("#collapseChartTwo").collapse("show");
      }
    });
  }
});

async function WindInformation(data) {
    const windContainer = document.getElementById("windContainer");
    windContainer.innerHTML = "";
    const windSpeed = data.WindSpeed;
    const windDirection = data.WindDirection;
    const windRapid = data.WindRapid;
    const length = windSpeed.length;
    for (let i = 0; i < length; i++) {
        const windBlock = document.createElement("div");
        windBlock.classList.add("windBlock");

        const ul = document.createElement("ul");
        ul.classList.add("list-group");

        const windTime = document.createElement("li");
        windTime.classList.add("list-group-item");
        windTime.innerText = windSpeed[i].time;

        const windValue = document.createElement("li");
        windValue.classList.add("list-group-item");
        windValue.innerText = Math.trunc(windSpeed[i].values) + ' м/с';

        const img = document.createElement("img");
        img.classList.add("windDirection");
        img.src = "dist/pictures/black-arrow.png";
        img.style.transform = `rotate(${windDirection[i].values}deg)`;

        const windDirectionText = document.createElement("li");
        windDirectionText.classList.add("list-group-item");
        windDirectionText.innerText = DirectionText(windDirection[i].values);
        windDirectionText.appendChild(img);

        ul.appendChild(windTime);
        ul.appendChild(windValue);
        ul.appendChild(windDirectionText);

        const windRapidValue = document.createElement("li");
        windRapidValue.classList.add("list-group-item");
        windRapidValue.innerText = 'Порывы: -';

        const lengthRapid = windRapid.length;
        for (let j = 0; j < lengthRapid; j++) {
            if (windSpeed[i].time == windRapid[j].time) {
                windRapidValue.innerText = 'Порывы: ' + Math.trunc(windRapid[j].values) + ' м/с';
            }
        }
        ul.appendChild(windRapidValue);
        windBlock.appendChild(ul);
        windContainer.appendChild(windBlock);
    }
}

function DirectionText(value) {
    if (value >= 0 && value < 22)
        return "С"
    if (value >= 22 && value < 45)
        return "ССВ"
    if (value >= 45 && value < 67)
        return "СВ"
    if (value >= 67 && value < 90)
        return "ВВС"
    if (value >= 90 && value < 112)
        return "В"
    if (value >= 112 && value < 135)
        return "ВЮВ"
    if (value >= 135 && value < 157)
        return "ЮВ"
    if (value >= 157 && value < 180)
        return "ЮЮВ"
    if (value >= 180 && value < 202)
        return "Ю"
    if (value >= 202 && value < 225)
        return "ЮЮЗ"
    if (value >= 225 && value < 247)
        return "ЮЗ"
    if (value >= 247 && value < 270)
        return "ЗЮЗ"
    if (value >= 270 && value < 292)
        return "З"
    if (value >= 292 && value < 315)
        return "ЗСЗ"
    if (value >= 315 && value < 337)
        return "СЗ"
    if (value >= 337 && value < 360)
        return "ССЗ"
    if (value == 360)
        return "С"
}

FillDate();
DownloadSitesList();
let DownloadedData;
let DownloadedWind;
let DownloadWindFromVantageData;
let a = DownloadSitesList();
let attribution;
UpdateInterface();
async function UpdateInterface() {
    const gif = document.getElementById("gif");
    gif.style.visibility = "visible";
    attribution = GetAttributes();
    const Time = GetTime(attribution.day_one, attribution.day_two, attribution.interval);
    let SitesList = await a;
    DownloadedData = (attribution.Station_List_Id == 0) ? await Download(Time, attribution) : await DownloadIndividual(Time, attribution, SitesList);
    DownloadedWind = await DownloadWind(Time, attribution);
    DownloadWindFromVantageData = await DownloadWindFromVantage(Time, attribution);
    const DataPerHourWindSpeed = FindData(DownloadedWind.WindSpeed, Time[0]);
    const DataPerHourWindDirection = FindData(DownloadedWind.WindDirection, Time[0]);
    const DataPerHourWind = FindData(DownloadWindFromVantageData.WindSpeed, Time[0]);
    const DataPerHourLayer = FindData(DownloadedData.DataForLayer, Time[0]);
    const DataPerHourDirection = FindData(DownloadWindFromVantageData.WindDirection, Time[0]);
    WindInformation(DownloadWindFromVantageData);
    /* Обновление */
    LayerUpdate(AddName(DataPerHourLayer, DownloadedData.DataSites), attribution).then(gif.style.visibility = "hidden");
    LayerUpdateWind(AddName(DataPerHourWindSpeed, DownloadedWind.SitesSet), AddName(DataPerHourWindDirection, DownloadedWind.SitesSet));
    PushTimeInSlide(Time);
    RefreshChart(DownloadedData.DataForGraph, MainChart);
    /*     RefreshAdditionalChart([], AdditionalChart); */
    ChangeWindSpeed(DataPerHourWind);
    ChangeDirectionArrow(DataPerHourDirection);
    LegendFormation(attribution.layerID ? attribution.layerID : attribution.indicator_id);
    document.getElementById('timedisplay').innerHTML = Time[0];

    console.log(DownloadedWind);
    console.log(DownloadWindFromVantageData);


}
$('.refresh').on('click', function () {
    UpdateInterface();
});

$('#range_footer').on('input', function () {
    let Time = this.list.children[this.value].innerHTML;
    document.getElementById('timedisplay').innerHTML = Time;
    const DataPerHourWind = FindData(DownloadWindFromVantageData.WindSpeed, Time);
    const DataPerHourLayer = FindData(DownloadedData.DataForLayer, Time);
    const DataPerHourDirection = FindData(DownloadWindFromVantageData.WindDirection, Time);
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
        const DataPerHourWind = FindData(DownloadWindFromVantageData.WindSpeed, Time);
        const DataPerHourLayer = FindData(DownloadedData.DataForLayer, Time);
        const DataPerHourDirection = FindData(DownloadWindFromVantageData.WindDirection, Time);
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

$('#timeinterval').on('change', function () {

    let datepicker = $('#day').datepicker().data('datepicker');
    datepicker.clear();

    if (this.value == '1day') {
        datepicker.view = 'months';
        datepicker.update({
            view: "months",
            minView: "months",
            range: false
        });

    }    if (this.value == '1hour') {
        datepicker.view = 'days';
        datepicker.update({
            view: "days",
            minView: "days",
            range: true

        });
    }});

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
