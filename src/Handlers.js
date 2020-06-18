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
                })
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
    };
    return Chart_Data;
};
//Обработка данных для слоя
async function ParseXMLDataForLayer(data, time, project) {
    let values_XML = data.getElementsByTagName("aggvalues")[0].childNodes;
    let values = []
    let values_set = [];

    let Dont = [3835, 3839, 3840, 3836, 3889, 3845, 3482, 3822, 3890, 3838, 3848, 3872, 3898];

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
        )
    }
    return values_set;
};
async function ParseXMLOne(data) {
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
};
async function ParseXMLOneForChart(data, id) {
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
};
//Обработка постов мониторинга
function ParseXMLSites(data) {
    let Sites_XML = data.getElementsByTagName("site");
    let Sites = [];
    let Dont = [3835, 3839, 3840, 3836, 3889, 3845, 3482, 3822, 3890, 3838, 3848, 3872, 3898]; // Неиспользуемые посты
    for (let i = 0; i < Sites_XML.length; i++) {
        if (Sites_XML[i].getAttribute('code').indexOf('ICAO') == false || Sites_XML[i].getAttribute('code').indexOf('uni') == false || Sites_XML[i].getAttribute('code').indexOf('ugms') == false || Sites_XML[i].getAttribute('code').indexOf('nke') == false || Sites_XML[i].getAttribute('code').indexOf('CA01') == false || Sites_XML[i].getAttribute('code').indexOf('s_') == false) {
            Sites.push({
                name: Sites_XML[i].getElementsByTagName("name")[0].firstChild.data,
                id: Sites_XML[i].getAttribute("id"),
                x: Sites_XML[i].getElementsByTagName("location")[0].getAttribute("x"),
                y: Sites_XML[i].getElementsByTagName("location")[0].getAttribute("y")
            })
        }
    }
    return Sites.filter(site => Dont.indexOf(+site.id) === -1);
};
//Domparser
function ParseText(data) {
    const parser = new DOMParser();
    return parser.parseFromString(data, "text/xml");
};

function FindData(data, time) {
    let values = 0;
    for (let i = 0; i < data.length; i++)
        if (data[i].time == time)
            values = data[i].values;
    return values;
};

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
};

export { ParseXMLDataForGraph, ParseXMLDataForLayer, ParseXMLSites, ParseText, FindData, AddName, ParseXMLOne, ParseXMLOneForChart };