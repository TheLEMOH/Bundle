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
    windValue.innerText = Math.trunc(windSpeed[i].values) + " м/с";

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
    windRapidValue.innerText = "Порывы: -";

    const lengthRapid = windRapid.length;
    for (let j = 0; j < lengthRapid; j++) {
      if (windSpeed[i].time == windRapid[j].time) {
        windRapidValue.innerText = "Порывы: " + Math.trunc(windRapid[j].values) + " м/с";
      }
    }
    ul.appendChild(windRapidValue);
    windBlock.appendChild(ul);
    windContainer.appendChild(windBlock);
  }
}

function DirectionText(value) {
  if (value >= 0 && value < 22) return "С";
  if (value >= 22 && value < 45) return "ССВ";
  if (value >= 45 && value < 67) return "СВ";
  if (value >= 67 && value < 90) return "ВВС";
  if (value >= 90 && value < 112) return "В";
  if (value >= 112 && value < 135) return "ВЮВ";
  if (value >= 135 && value < 157) return "ЮВ";
  if (value >= 157 && value < 180) return "ЮЮВ";
  if (value >= 180 && value < 202) return "Ю";
  if (value >= 202 && value < 225) return "ЮЮЗ";
  if (value >= 225 && value < 247) return "ЮЗ";
  if (value >= 247 && value < 270) return "ЗЮЗ";
  if (value >= 270 && value < 292) return "З";
  if (value >= 292 && value < 315) return "ЗСЗ";
  if (value >= 315 && value < 337) return "СЗ";
  if (value >= 337 && value < 360) return "ССЗ";
  if (value == 360) return "С";
}

export { WindInformation };
