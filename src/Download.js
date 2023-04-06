import * as Handlers from "./Handlers";
import { GetAttributes, GetTime } from "./Attributes";

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
    .then((res) => Handlers.ParseText(res))
    .then((res) => Handlers.ParseXMLSites(res));
  const Data = await RawData.then((res) => res.text()).then((res) => Handlers.ParseText(res));
  let WindSpeed = await RawWindSpeed.then((res) => res.text()).then((res) => Handlers.ParseText(res));
  let WindDirection = await RawWindDirection.then((res) => res.text()).then((res) => Handlers.ParseText(res));
  const DataForGraph = Handlers.ParseXMLDataForGraph(Data, DataSites, layerID);
  const DataForLayer = Handlers.ParseXMLDataForLayer(Data, Time, attribution.station_id);
  WindSpeed = Handlers.ParseXMLOne(WindSpeed);
  WindDirection = Handlers.ParseXMLOne(WindDirection);
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
      const Data = await RawData.then((res) => res.text()).then((res) => Handlers.ParseText(res));
      const Graph = Handlers.ParseXMLDataForGraph(Data, SitesList, layerID);
      const Layer = await Handlers.ParseXMLDataForLayer(Data, Time, ListStation[i][j].project);
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
  let WindSpeed = await RawWindSpeed.then((res) => res.text()).then((res) => Handlers.ParseText(res));
  let WindDirection = await RawWindDirection.then((res) => res.text()).then((res) => Handlers.ParseText(res));
  WindSpeed = Handlers.ParseXMLOne(WindSpeed);
  WindDirection = Handlers.ParseXMLOne(WindDirection);
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
  Sites_Set_Regional = Handlers.ParseText(Sites_Set_Regional);
  Sites_Set_Regional = Handlers.ParseXMLSites(Sites_Set_Regional);

  Sites_Set_KNC = await Sites_Set_KNC.then((res) => res.text());
  Sites_Set_KNC = Handlers.ParseText(Sites_Set_KNC);
  Sites_Set_KNC = Handlers.ParseXMLSites(Sites_Set_KNC);

  Sites_Set_Nebo = await Sites_Set_Nebo.then((res) => res.text());
  Sites_Set_Nebo = Handlers.ParseText(Sites_Set_Nebo);
  Sites_Set_Nebo = Handlers.ParseXMLSites(Sites_Set_Nebo);

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
    .then((res) => Handlers.ParseText(res))
    .then((res) => Handlers.ParseXMLSites(res));
  const SitesSetMETAR = await RawDataStationsMETAR.then((res) => res.text())
    .then((res) => Handlers.ParseText(res))
    .then((res) => Handlers.ParseXMLSites(res));
  const SitesSetUGMS = await RawDataStationsUGMS.then((res) => res.text())
    .then((res) => Handlers.ParseText(res))
    .then((res) => Handlers.ParseXMLSites(res));
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
    .then((res) => Handlers.ParseText(res))
    .then((res) => Handlers.ParseXMLDataForLayer(res, Time, 1));
  const WindDirection = await RawDataWindDirection.then((res) => res.text())
    .then((res) => Handlers.ParseText(res))
    .then((res) => Handlers.ParseXMLDataForLayer(res, Time, 1));
  const WindSpeedMETAR = await RawDataWindSpeedMETAR.then((res) => res.text())
    .then((res) => Handlers.ParseText(res))
    .then((res) => Handlers.ParseXMLDataForLayer(res, Time, 1));
  const WindDirectionMETAR = await RawDataWindDirectionMETAR.then((res) => res.text())
    .then((res) => Handlers.ParseText(res))
    .then((res) => Handlers.ParseXMLDataForLayer(res, Time, 1));
  const WindSpeedUGMS = await RawDataWindSpeedUGMS.then((res) => res.text())
    .then((res) => Handlers.ParseText(res))
    .then((res) => Handlers.ParseXMLDataForLayer(res, Time, 1));
  const WindDirectionUGMS = await RawDataWindDirectionUGMS.then((res) => res.text())
    .then((res) => Handlers.ParseText(res))
    .then((res) => Handlers.ParseXMLDataForLayer(res, Time, 1));

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
    .then((res) => Handlers.ParseText(res))
    .then((res) => Handlers.ParseXMLOne(res, Time, 1));
  const WindDirection = await RawDataWindDirection.then((res) => res.text())
    .then((res) => Handlers.ParseText(res))
    .then((res) => Handlers.ParseXMLOne(res, Time, 1));
  const WindRapid = await RawDataWindRapid.then((res) => res.text())
    .then((res) => Handlers.ParseText(res))
    .then((res) => Handlers.ParseXMLOne(res, Time, 1));

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
          .then((res) => Handlers.ParseText(res))
          .then((res) => Handlers.ParseXMLOneForChart(res, Indicators[i]))
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

export { Download, DownloadSitesList, DownloadIndividual, DownloadWind, DownLoadMultiIndicator, DownloadWindFromVantage };
