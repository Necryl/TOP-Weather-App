/* eslint-disable no-console */
/* eslint-disable no-unused-vars */
import mainStyles from "./../styles/main.css";

// elements
const loadingTextElem = document.querySelector("h1");
const responseTextElem = document.querySelector("p");

// config variables
const key = "3602d3a3f6d0872ec04e0053d57c62b2";
const units = "metric"; // metric = celsius, imperial = fahrenheit

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
  responseTextElem.textContent = JSON.stringify(result);
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

// run on start
loader.setDefaultFuncs(
  () => {
    loadingTextElem.classList.remove("hide");
  },
  () => {
    loadingTextElem.classList.add("hide");
  }
);
loader.run([
  async () => {
    const [coords] = await convertToCoordinates("london");
    await fetchWeather(coords[0], coords[1]);
  },
]);
