import { GetColorScheme, GetRange, RangeConversion, RangeConversionMainPoint, GenerateColorMainPoint, GetColorForPoligon } from "./Attributes";
import { MainChart, AdditionalChart, RefreshAdditionalChart, CloseOpenChart } from "./Chart";
import { DownLoadMultiIndicator } from "./Download";
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

export { LayerUpdate, LayerUpdateWind };
