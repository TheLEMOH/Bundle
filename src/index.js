import { Download, DownloadSitesList, DownloadIndividual, DownloadWind } from './Download'
import { FillDate, GetTime, GetAttributes, PushTimeInSlide, ChangeWindSpeed, LegendFormation, ChangeDirectionArrow } from './Attributes'
import * as Handlers from './Handlers'
import { LayerUpdate, LayerUpdateWind } from './Map'
import { MainChart, RefreshChart, AdditionalChart, CloseOpenChart,RefreshAdditionalChart } from './Chart'

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
    DownloadedWind = await DownloadWind(Time,attribution);
    const DataPerHourWindSpeed = Handlers.FindData(DownloadedWind.WindSpeed, Time[0]);
    const DataPerHourWindDirection = Handlers.FindData(DownloadedWind.WindDirection, Time[0]);
    const DataPerHourWind = Handlers.FindData(DownloadedData.WindSpeed, Time[0]);
    const DataPerHourLayer = Handlers.FindData(DownloadedData.DataForLayer, Time[0]);
    const DataPerHourDirection = Handlers.FindData(DownloadedData.WindDirection, Time[0]);
    /* Обновление */
    LayerUpdate(Handlers.AddName(DataPerHourLayer, DownloadedData.DataSites), attribution);
    LayerUpdateWind(Handlers.AddName(DataPerHourWindSpeed, DownloadedWind.SitesSet), Handlers.AddName(DataPerHourWindDirection, DownloadedWind.SitesSet));
    PushTimeInSlide(Time);
    RefreshChart(DownloadedData.DataForGraph, MainChart);
/*     RefreshAdditionalChart([], AdditionalChart); */
    ChangeWindSpeed(DataPerHourWind);
    ChangeDirectionArrow(DataPerHourDirection);
    LegendFormation(attribution.layerID ? attribution.layerID : attribution.indicator_id);
    document.getElementById('timedisplay').innerHTML = Time[0];
};

$('.refresh').on('click', function () {
    UpdateInterface();
});

$('#range_footer').on('input', function () {
    let Time = this.list.children[this.value].innerHTML;
    document.getElementById('timedisplay').innerHTML = Time;
    const DataPerHourWind = Handlers.FindData(DownloadedData.WindSpeed, Time);
    const DataPerHourLayer = Handlers.FindData(DownloadedData.DataForLayer, Time);
    const DataPerHourDirection = Handlers.FindData(DownloadedData.WindDirection, Time);
    const DataPerHourWindSpeed = Handlers.FindData(DownloadedWind.WindSpeed, Time);
    const DataPerHourWindDirection = Handlers.FindData(DownloadedWind.WindDirection, Time);
    LayerUpdate(Handlers.AddName(DataPerHourLayer, DownloadedData.DataSites), attribution);
    LayerUpdateWind(Handlers.AddName(DataPerHourWindSpeed, DownloadedWind.SitesSet), Handlers.AddName(DataPerHourWindDirection, DownloadedWind.SitesSet));
    ChangeWindSpeed(DataPerHourWind);
    ChangeDirectionArrow(DataPerHourDirection);
});

$('#collapseChartOne').on('shown.bs.collapse', function () {
    try {
        MainChart.update();
    }
    catch (e) {
        console.log('График не загружен')
    }
});

$('#collapseChartTwo').on('shown.bs.collapse', function () {
    try {
        AdditionalChart.update();
    }
    catch (e) {
        console.log('График не загружен')
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
        const DataPerHourWind = Handlers.FindData(DownloadedData.WindSpeed, Time);
        const DataPerHourLayer = Handlers.FindData(DownloadedData.DataForLayer, Time);
        const DataPerHourDirection = Handlers.FindData(DownloadedData.WindDirection, Time);
        LayerUpdate(Handlers.AddName(DataPerHourLayer, DownloadedData.DataSites), attribution);
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
            const DataPerHourWind = Handlers.FindData(DownloadedData.WindSpeed, Time);
            const DataPerHourLayer = Handlers.FindData(DownloadedData.DataForLayer, Time);
            const DataPerHourDirection = Handlers.FindData(DownloadedData.WindDirection, Time);
            LayerUpdate(Handlers.AddName(DataPerHourLayer, DownloadedData.DataSites), attribution);
            ChangeWindSpeed(DataPerHourWind);
            ChangeDirectionArrow(DataPerHourDirection);
        }
});

$('#AirIsolines').on('change', function () {

    let Time = document.getElementById('timedisplay').innerHTML;
    const DataPerHourLayer = Handlers.FindData(DownloadedData.DataForLayer, Time);
    LayerUpdate(Handlers.AddName(DataPerHourLayer, DownloadedData.DataSites), attribution);

});

$('#AirBarriers').on('change', function () {

    let Time = document.getElementById('timedisplay').innerHTML;
    const DataPerHourLayer = Handlers.FindData(DownloadedData.DataForLayer, Time);
    LayerUpdate(Handlers.AddName(DataPerHourLayer, DownloadedData.DataSites), attribution);

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
    const DataPerHourLayer = Handlers.FindData(DownloadedData.DataForLayer, Time);
    const DataPerHourWindSpeed = Handlers.FindData(DownloadedWind.WindSpeed, Time);
    const DataPerHourWindDirection = Handlers.FindData(DownloadedWind.WindDirection, Time);
    LayerUpdate(Handlers.AddName(DataPerHourLayer, DownloadedData.DataSites), attribution);
    LayerUpdateWind(Handlers.AddName(DataPerHourWindSpeed, DownloadedWind.SitesSet), Handlers.AddName(DataPerHourWindDirection, DownloadedWind.SitesSet));
});

$('.radio').on('change', function () {
    document.getElementById('airChangeLayer').innerHTML = ``;
    const listRadio = document.getElementsByClassName('radio');
    for (let i = 0; i < listRadio.length; i++) {
        if (listRadio[i].checked == true) {
            document.getElementById('airChangeLayer').innerHTML += `<option value="${listRadio[i].id}">${listRadio[i].name}</option>`;
        }
    }
})


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
}