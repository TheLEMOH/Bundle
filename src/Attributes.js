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
};
/* Список диапазонов */
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
};
/* Преобразование диапазонов */
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
    };

    return result;
};

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
};

/* Формирование легенды */
async function LegendFormation(id) {
    document.getElementById('airLegendHeader').innerText = 'Легенда';
    document.getElementById('airLegendBody').innerHTML = '';
    let label;
    let colorScheme = (GetColorScheme('legend', id));
    let st = [];
    if (colorScheme == 'none') {
        document.getElementById('airLegendBody').innerHTML += `Легенда отсуствует`;
    }
    else {
        if (id == 348) {
            st = [12, 35, 70, 150, 200, 250];
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
};
/* Получение настроек из меню пользователя */

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
};
/* Настройки для календаря */
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
    day_2.setDate(day_1.getDate() + 1)
    myDatepicker.selectDate(day_1);
    myDatepicker.selectDate(day_2);
};
/* Добавление времени на линейку */
function PushTimeInSlide(Time) {
    $("#tickmarks").children().remove();
    for (let i = 0; i < Time.length; i++) {
        $("#tickmarks").append('<option value="' + i + '">' + Time[i] + '</option>');
    }
    $("#range_footer").attr("min", 0);
    $("#range_footer").attr("max", Time.length - 1);
};
/* Генерирование цветовой схемы по опорным точками */

function GenerateColorMainPoint(colorScheme, inverval) {
    let newColorSheme = [];
    for (let i = 1; i < colorScheme.length; i++) {
        newColorSheme.push(...GenerateColor(colorScheme[i], colorScheme[i - 1], inverval));
    }
    return newColorSheme;
};

/* Генерирование градиента по двум точкам */
function GenerateColor(colorStart, colorEnd, colorCount) {
    // The beginning of your gradient
    var start = [
        colorStart.split(',')[0].split('rgb(')[1],
        colorStart.split(',')[1],
        colorStart.split(',')[2].split(')')[0],
    ]
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
};

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
    };
    if (id == 103) {
        colorScheme = ["rgb(0,0,160)", "rgb(23,15,145)", "rgb(46,30,130)", "rgb(69,45,116)", "rgb(92,60,101)", "rgb(115,75,87)", "rgb(139,90,72)", "rgb(162,105,58)", "rgb(185,120,43)", "rgb(208,135,29)", "rgb(231,150,14)", "rgb(255,166,0)", "rgb(255,110,0)", "rgb(255,55,0)"];
    };
    if (id == 102) {
        colorScheme = ['rgb(239,243,255)', 'rgb(198,219,239)', 'rgb(158,202,225)', 'rgb(107,174,214)', 'rgb(49,130,189)', 'rgb(8,81,156)']
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
        colorScheme = ["rgb(37,75,233)", "rgb(60,67,223)", "rgb(84,58,213)", "rgb(107,50,202)", "rgb(131,42,192)", "rgb(154,33,182)", "rgb(177,25,171)", "rgb(201,16,161)", "rgb(224,8,151)", "rgb(247,9,141)"]
    };
    if (type == 'd3') {
        let c20 = d3.scale.category20(), col = d3.range(20).map(function (c) {
            return c20(c).replace("#", "0x")
        });
        const rgb = Hex_To_Rgb(c20(id));
        return 'rgb(' + rgb['r'] + ',' + rgb['g'] + ',' + rgb['b'] + ')';
    };
    if (type == 'dots') {
        for (let i = 0; i < range.length; i++) {
            if (value <= range[i])
                return colorScheme[i];
            if (value > range[range.length - 1])
                return colorScheme[colorScheme.length - 1];
        };
    };
    if (type == 'polygons') {
        for (let i = 0; i < range.length; i++) {
            if (value == range[i]) {
                return colorScheme[i];
            };
        };
    };
    if (type == 'legend') {
        return colorScheme;
    };
    return colorScheme;
};

function GetColorForPoligon(colorScheme, range, value) {
    for (let i = 0; i < range.length; i++) {
        if (value == range[i]) {
            return colorScheme[i];
        };
    };

};

function GetColorForVoronoi(colorScheme, range, value) {
    if (value <= +range[0].slice(1)) return colorScheme[0]

    for (let i = 1; i < range.length - 1; i++) {
        const ranges = range[i].split('-')
        if (value < +ranges[1] && value >= +ranges[0]) {
            return colorScheme[i];
        };
    };

    if (value > +range[range.length - 1].slice(0, -1)) return colorScheme[colorScheme.length - 1]
};

async function ChangeWindSpeed(data) {
    document.getElementById("windspeed").innerText = data.toFixed(1) + ' м/с';
};

async function ChangeDirectionArrow(data) {
    document.getElementById("Direction_Arrow").style = "transform: rotate(" + data + "deg);"
};


export {
    GetColorForPoligon,
    GetColorForVoronoi,
    GetTime,
    GetAttributes,
    GetRange,
    FillDate,
    PushTimeInSlide,
    ChangeWindSpeed,
    GetColorScheme,
    LegendFormation,
    RangeConversion,
    ChangeDirectionArrow,
    RangeConversionMainPoint,
    GenerateColorMainPoint
}