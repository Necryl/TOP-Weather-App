/* eslint-disable no-console */
/* eslint-disable no-unused-vars */
import _ from "lodash";
import mainStyles from "./../styles/main.css";
import inputStyles from "./../styles/input.css";
import currentStyles from "./../styles/current.css";
import forecastStyles from "./../styles/forecast.css";
import detailsStyles from "./../styles/details.css";

// elements
const bodyElem = document.querySelector("body");

const nameInputElem = document.querySelector("#nameInput");
const latLonInputsElem = document.querySelector("#lat-lon-inputs");
const latInputElem = document.querySelector("#latInput");
const lonInputElem = document.querySelector("#lonInput");
const inputElems = [nameInputElem, ...latLonInputsElem.children];
const searchBtnElem = document.querySelector("#search");
const toggleUnitInputElem = document.querySelector("#toggleUnit input");
const toggleLocTypeInputElem = document.querySelector("#toggleLocType input");
const toggleLocTypeSpanElem = document.querySelector("#toggleLocType span");

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

const UI = (() => {
  toggleLocTypeInputElem.addEventListener("input", (event) => {
    if (event.target.checked) {
      toggleLocTypeSpanElem.textContent = "Use location name";
      nameInputElem.classList.add("hide");
      latLonInputsElem.classList.remove("hide");
    } else {
      toggleLocTypeSpanElem.textContent = "Use latitude and longitude";
      nameInputElem.classList.remove("hide");
      latLonInputsElem.classList.add("hide");
    }
  });

  async function validateInput() {
    let result = true;
    const inputs = toggleLocTypeInputElem.checked
      ? [...latLonInputsElem.children]
      : [nameInputElem];
    for (let i = 0; i < inputs.length; i++) {
      const input = inputs[i];
      input.setCustomValidity("");
      if (input.value.trim() === "") {
        input.setCustomValidity("This cannot be empty");
        input.reportValidity();
        result = false;
        break;
      }
      if (input.validity.valid === false) {
        input.setCustomValidity(
          input === nameInputElem
            ? "Please enter a valid location name"
            : "Please enter a valid decimal"
        );
        input.reportValidity();
        result = false;
        break;
      }
    }
    if (result === true) {
      if (toggleLocTypeInputElem.checked) {
        // eslint-disable-next-line no-use-before-define
        const data = await Data.fetchWeather(
          latInputElem.value.trim(),
          lonInputElem.value.trim()
        );
      } else {
        // eslint-disable-next-line no-use-before-define
        const data = await Data.convertToCoordinates(
          nameInputElem.value.trim()
        );
        console.log(data);
        if (data.length === 0) {
          nameInputElem.setCustomValidity(
            "Couldn't find a match, are you sure the spelling is correct?"
          );
          nameInputElem.reportValidity();
          result = false;
        }
      }
    }
    return result;
  }

  searchBtnElem.addEventListener("click", async () => {
    const ready = await validateInput();
    if (ready) {
      bodyElem.classList.add("display");
    }
  });

  inputElems.forEach((elem) => {
    elem.addEventListener("focus", () => {
      bodyElem.classList.remove("display");
    });
    elem.addEventListener("input", () => {
      elem.setCustomValidity("");
    });
    elem.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        elem.blur();
        searchBtnElem.click();
      }
    });
  });

  function initialize() {}

  return {
    initialize,
  };
})();

const Data = (() => {
  const dataHistory = {};
  const nameHistory = {};

  async function convertToCoordinates(input) {
    let result;
    if (_.includes(Object.keys(nameHistory), input)) {
      console.log("convertToCoordinates() found an entry in history");
      result = nameHistory[input];
    } else {
      console.log(
        "convertToCoordinates() didn't find an entry in history, fetching new data from OpenWeather API"
      );
      const url = `http://api.openweathermap.org/geo/1.0/direct?q=${input}&appid=${key}`;
      result = await fetch(url, { mode: "cors" })
        .then((response) => response.json())
        .then((data) =>
          data.reduce((final, current) => {
            console.count(`Result counter for '${input}'`);
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
      nameHistory[input] = result;
    }
    return result;
  }

  async function fetchWeather(lat, lon) {
    console.log("fetchWeather fetching...");
    let result;
    if (_.includes(Object.keys(dataHistory), `${lat}, ${lon}`)) {
      console.log("fetchWEather() found a entry in history");
      result = dataHistory[[lat, lon]];
    } else {
      console.log(
        "fetchWeather() didn't find an entry in history, fetching new data from OpenWeather API"
      );
      const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${key}`;
      result = await fetch(url, { mode: "cors" })
        .then((response) => response.json())
        .then((data) => {
          console.log(data);
          return data;
        })
        .catch((msg) => {
          throw Error(msg);
        });
      dataHistory[[lat, lon]] = result;
      setTimeout(() => {
        delete dataHistory[[lat, lon]];
      }, 600000); // removes the entry after 10 minutes. OpenWeather API only updates the data every 10 minutes.
    }
    return result;
  }

  return {
    convertToCoordinates,
    fetchWeather,
  };
})();

// events
toggleUnitInputElem.addEventListener("input", (event) => {
  units = event.target.checked ? "imperial" : "metric"; // metric = celsius, imperial = fahrenheit
});

// run on start
UI.initialize();
