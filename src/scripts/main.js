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

const UI = (() => {
  const activeElement = {
    history: [null, null, null, null, null],
    failedAttempts: 0,
  };
  // the following events and function update activeElement object
  (() => {
    document.addEventListener("focus", updateActiveElementHistory, true);
    document.addEventListener("blur", updateActiveElementHistory, true);
    document.addEventListener("click", updateActiveElementHistory, true);
    document.addEventListener(
      "keydown",
      (event) => {
        if (event.key === "Tab") {
          updateActiveElementHistory();
        }
      },
      true
    );
    function updateActiveElementHistory() {
      setTimeout(() => {
        if (
          activeElement.history[activeElement.history.length - 1] !==
          document.activeElement
        ) {
          activeElement.failedAttempts = 0;
          activeElement.history.shift();
          activeElement.history.push(document.activeElement);
        } else {
          activeElement.failedAttempts += 1;
        }
      }, 0);
    }
  })();

  function updateInputSectionSize() {
    inputSectionElem.style.height = `${inputWrapperElem.clientHeight}px`;
    inputSectionElem.style.width = `${inputWrapperElem.clientWidth}px`;
  }

  function setInputValidity(element) {
    element.setCustomValidity("");
    if (!element.validity.valid || element.value.trim() === "") {
      if (element.id === "name") {
        element.setCustomValidity("Please enter the location name");
      } else {
        element.setCustomValidity("Please enter an integer or a decimal");
      }
    }
  }

  function focusOnTheFirstInputElem() {
    for (let i = 0; i < inputElems.length; i++) {
      if (inputElems[i].classList.contains("hide") === false) {
        inputElems[i].focus();
        inputElems[i].dispatchEvent(new Event("focus"));
        break;
      }
    }
  }

  function setNameInput(value) {
    nameInputElem.value = value;
    setInputValidity(nameInputElem);
  }

  function setLatLonInput(latValue = null, lonValue = null) {
    if (latValue !== null) {
      latInputElem.value = latValue;
      setInputValidity(latInputElem);
    }
    if (lonValue !== null) {
      lonInputElem.value = lonValue;
      setInputValidity(lonInputElem);
    }
  }

  (() => {
    // input section events
    let userFocusedFlag = false;
    let mouseOutsideFlag = true;
    inputWrapperElem.addEventListener("mouseenter", () => {
      mouseOutsideFlag = false;
      inputWrapperElem.classList.add("fbi-open-up");
      if (userFocusedFlag === false) {
        focusOnTheFirstInputElem();
      }
    });
    inputElems.forEach((element) => {
      element.addEventListener("click", () => {
        userFocusedFlag = true;
        mouseOutsideFlag = false;
        inputWrapperElem.classList.add("fbi-open-up");
      });
      element.addEventListener("input", () => {
        userFocusedFlag = true;
        setInputValidity(element);
      });
      element.addEventListener("blur", () => {
        userFocusedFlag = false;
        if (mouseOutsideFlag) {
          inputWrapperElem.dispatchEvent(new Event("mouseleave"));
        }
      });
      element.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
          userFocusedFlag = false;
          searchBtnElem.click();
        }
      });
    });
    inputWrapperElem.addEventListener("mouseleave", () => {
      mouseOutsideFlag = true;
      if (userFocusedFlag === false) {
        inputWrapperElem.classList.remove("fbi-open-up");
        inputElems.forEach((element) => {
          element.blur();
        });
      }
    });
    inputWrapperElem.addEventListener("transitionend", (event) => {
      if (event.target === inputWrapperElem && mouseOutsideFlag) {
        updateInputSectionSize();
      }
    });
    toggleLocTypeInputElem.addEventListener(
      "input",
      () => {
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

        focusOnTheFirstInputElem();
      },
      false
    );
  })();

  function initialize() {
    updateInputSectionSize();

    toggleUnitsInputElem.checked = true; // setting units to celsius ('metric')
    toggleUnitsInputElem.dispatchEvent(new Event("input"));

    inputElems.forEach((element) => {
      setInputValidity(element);
    });
  }

  return {
    initialize,
    focusOnTheFirstInputElem,
    setNameInput,
    setLatLonInput,
  };
})();

const Data = (() => {
  async function convertToCoordinates(input) {
    const url = `http://api.openweathermap.org/geo/1.0/direct?q=${input}&appid=${key}`;
    const result = await fetch(url, { mode: "cors" })
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

  return {
    convertToCoordinates,
    fetchWeather,
  };
})();

// events

searchBtnElem.addEventListener("click", () => {
  let formValidated = true;
  const inputElements = toggleLocTypeInputElem.checked
    ? inputElems.slice(1)
    : [nameInputElem];
  inputElements.forEach((element) => {
    if (element.validity.valid === false || element.value === "") {
      element.reportValidity();
      formValidated = false;
    }
  });
  if (formValidated) {
    loader.run([
      async () => {
        let coords;
        let ready = true;
        if (toggleLocTypeInputElem.checked) {
          console.log("using lat and lon");
          coords = [
            String(Number(latInputElem.value.trim())),
            String(Number(lonInputElem.value.trim())),
          ];
          [latInputElem.value, lonInputElem.value] = coords;
        } else {
          console.log("using name");
          const nameInput = nameInputElem.value.trim();
          if (
            /^([a-zA-Z\u0080-\u024F]+(?:. |-| |'))*[a-zA-Z\u0080-\u024F]*$/.test(
              nameInput
            )
          ) {
            [coords] = await Data.convertToCoordinates(nameInput);
            if (typeof coords === "undefined" && !Array.isArray(coords)) {
              ready = false;
            } else {
              UI.setLatLonInput(...coords);
            }
          } else {
            ready = false;
            console.log("the inputName didn't pass the regex test");
          }
        }
        if (ready) {
          const data = await Data.fetchWeather(coords[0], coords[1]);
          if (data.cod === "400") {
            if (toggleLocTypeInputElem.checked) {
              if (data.message.includes("latitude")) {
                latInputElem.setCustomValidity(data.message);
                latInputElem.reportValidity();
              } else if (data.message.includes("longitude")) {
                lonInputElem.setCustomValidity(data.message);
                lonInputElem.reportValidity();
              }
            } else {
              nameInputElem.setCustomValidity(data.message);
              nameInputElem.reportValidity();
            }
            console.warn("API Error [400]:", data.message);
          } else {
            inputWrapperElem.dispatchEvent(new Event("mouseleave"));
            UI.setNameInput(data.name);
            currentElem.querySelector("#input + span").textContent =
              JSON.stringify(data);
          }
        } else {
          nameInputElem.setCustomValidity(
            "Couldn't find a match. Are you sure the spelling is correct?"
          );
          nameInputElem.reportValidity();
        }
      },
    ]);
  }
});
toggleUnitsInputElem.addEventListener("input", () => {
  units = toggleUnitsInputElem.checked ? "metric" : "imperial";
});

// run on start
UI.initialize();
