/* eslint-disable no-console */
/* eslint-disable no-unused-vars */
import mainStyles from "./../styles/main.css";
import inputStyles from "./../styles/input.css";
import currentStyles from "./../styles/current.css";
import forecastStyles from "./../styles/forecast.css";
import detailsStyles from "./../styles/details.css";

// elements
const inputSectionElem = document.querySelector("#input");
const inputWrapperElem = document.querySelector("#input-wrapper");
const searchWrapperElem = document.querySelector(".search-wrapper");
const inputLabelElem = document.querySelector("#inputLabel");
const nameInputElem = document.querySelector("#name");
const latLonContainerElem = document.querySelector("#lat-lon-container");
const latInputElem = document.querySelector("#lat");
const lonInputElem = document.querySelector("#lon");
const inputElems = [nameInputElem, latInputElem, lonInputElem];
const searchBtnElem = document.querySelector(".search-wrapper button");
const toggleUnitsInputElem = document.querySelector("#toggle-units input");
const toggleLocTypeInputElem = document.querySelector("#toggle-loc-type input");
const toggleLocTypeSpanElem = document.querySelector("#toggle-loc-type span");

const currentElem = document.querySelector("#current");

// config variables
const key = "3602d3a3f6d0872ec04e0053d57c62b2";
let units = "metric"; // metric = celsius, imperial = fahrenheit

// status variables

/* eslint-enable no-unused-vars */

// modules
const loader = (() => {
  const loadingProcesses = [];

  const defaultLoader = {
    on: () => {
      console.log("starting to load");
    },
    off: () => {
      console.log("loading done");
    },
  };

  function newProcess(onFunc, offFunc) {
    const index = loadingProcesses.length;
    const loaderObject = {
      on: onFunc,
      off: offFunc,
    };
    loadingProcesses.push({ loader: loaderObject, status: false });
    return index;
  }

  function start(processIndex) {
    const process = loadingProcesses[processIndex];
    process.status = true;
    process.loader.on();
  }

  function end(processIndex) {
    const process = loadingProcesses[processIndex];
    process.status = false;
    process.loader.off();
  }

  async function run(
    [func, ...params],
    onFunc = defaultLoader.on,
    offFunc = defaultLoader.off
  ) {
    const processIndex = newProcess(onFunc, offFunc);
    start(processIndex);
    const result = await func(...params);
    end(processIndex);
    return result;
  }

  function setDefaultFuncs(onFunc, offFunc) {
    if (typeof onFunc === "function") {
      defaultLoader.on = onFunc;
    }
    if (typeof offFunc === "function") {
      defaultLoader.off = offFunc;
    }
  }

  return {
    run,
    setDefaultFuncs,
  };
})();

// functions
async function convertToCoordinates(input) {
  const url = `http://api.openweathermap.org/geo/1.0/direct?q=${input}&appid=${key}`;
  const result = await fetch(url, { mode: "cors" })
    .then((response) => response.json())
    .then((data) =>
      data.reduce((final, current) => {
        final.push([
          current.lat,
          current.lon,
          current.name,
          current.state,
          current.country,
        ]);
        return final;
      }, [])
    )
    .catch((msg) => {
      throw Error(msg);
    });
  return result;
}

async function fetchWeather(lat, lon) {
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${key}`;
  const result = await fetch(url, { mode: "cors" })
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      return data;
    })
    .catch((msg) => {
      throw Error(msg);
    });
  return result;
}

function updateInputSectionSize() {
  inputSectionElem.style.height = `${inputWrapperElem.clientHeight}px`;
  inputSectionElem.style.width = `${inputWrapperElem.clientWidth}px`;
}

// events
(() => {
  let userFocusedFlag = false;
  let mouseOutsideFlag = true;
  inputWrapperElem.addEventListener("mouseenter", () => {
    mouseOutsideFlag = false;
    if (userFocusedFlag === false) {
      for (let i = 0; i < inputElems.length; i++) {
        if (inputElems[i].classList.contains("hide") === false) {
          inputElems[i].focus();
          break;
        }
      }
    }
  });
  inputElems.forEach((element) => {
    element.addEventListener("click", () => {
      userFocusedFlag = true;
    });
    element.addEventListener("input", () => {
      userFocusedFlag = true;
    });
    element.addEventListener("blur", () => {
      userFocusedFlag = false;
    });
  });
  inputWrapperElem.addEventListener("mouseleave", () => {
    mouseOutsideFlag = true;
    if (userFocusedFlag === false) {
      [...inputElems, ...inputWrapperElem.querySelectorAll("button")].forEach(
        (element) => {
          element.blur();
        }
      );
    }
  });
  inputWrapperElem.addEventListener("transitionend", (event) => {
    if (event.target === inputWrapperElem && mouseOutsideFlag) {
      updateInputSectionSize();
    }
  });
})();
searchBtnElem.addEventListener("click", () => {
  loader.run([
    async () => {
      let coords;
      if (toggleLocTypeInputElem.checked) {
        console.log("using lat and lon");
        coords = [latInputElem.value, lonInputElem.value];
      } else {
        console.log("using name");
        [coords] = await convertToCoordinates(nameInputElem.value.trim());
      }
      const data = await fetchWeather(coords[0], coords[1]);
      currentElem.querySelector("#input + span").textContent =
        JSON.stringify(data);
    },
  ]);
});
toggleUnitsInputElem.addEventListener("input", () => {
  units = toggleUnitsInputElem.checked ? "metric" : "imperial";
});
toggleLocTypeInputElem.addEventListener("input", () => {
  const elem = toggleLocTypeInputElem;
  [...inputLabelElem.children].forEach((element) => {
    if (
      (element === nameInputElem && elem.checked) ||
      (!elem.checked && element !== nameInputElem)
    ) {
      element.classList.add("hide");
    } else {
      element.classList.remove("hide");
    }
  });
});

// run on start
toggleUnitsInputElem.checked = true; // setting units to celsius ('metric')
toggleUnitsInputElem.dispatchEvent(new Event("input"));

updateInputSectionSize();
