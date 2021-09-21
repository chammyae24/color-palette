//Global selections and Variables
const colorDivs = document.querySelectorAll(".color");
const generateBtn = document.querySelector(".generate");
const sliders = document.querySelectorAll('input[type="range"]');
const currentHexes = document.querySelectorAll(".color h2");
const copyContainer = document.querySelector(".copy-container");
const copyPopup = document.querySelector(".copy-popup");
const adjustButton = document.querySelectorAll(".adjust");
const lockButton = document.querySelectorAll(".lock");
const closeAdjust = document.querySelectorAll(".close-adjustment");
const sliderPanel = document.querySelectorAll(".sliders");
const refresh = document.querySelector(".generate");
let initialColors;

//This is for Local Storage
let savePalettes = [];

//Add event linear
sliders.forEach((slider) => {
  slider.addEventListener("input", hslControls);
});

colorDivs.forEach((div, index) => {
  div.addEventListener("change", () => {
    updateTextUI(index);
  });
});

currentHexes.forEach((hex) => {
  hex.addEventListener("click", () => {
    copyToClipboard(hex);
  });
});

copyContainer.addEventListener("transitionend", () => {
  copyContainer.classList.remove("active");
  copyPopup.classList.remove("active");
});

adjustButton.forEach((adj, index) => {
  adj.addEventListener("click", () => {
    // openAdjustmentPanel(index);
    sliderPanel[index].classList.toggle("active");
  });
});
closeAdjust.forEach((close, index) => {
  close.addEventListener("click", () => {
    sliderPanel[index].classList.toggle("active");
  });
});

refresh.addEventListener("click", () => {
  randomColor();
});

lockButton.forEach((lock, index) => {
  lock.addEventListener("click", (e) => {
    // console.log(lock, index);
    colorDivs[index].classList.toggle("locked");
    // console.log(e.target);
    if (colorDivs[index].classList.contains("locked")) {
      e.target.innerHTML = '<i class="fas fa-lock"></i>';
    } else {
      e.target.innerHTML = '<i class="fas fa-lock-open">';
    }
  });
});

//functions

//Color Generator with plain
// function generateHex() {
//   const letters = "0123456789ABCDEF";
//   let hash = "#";
//   for (let i = 0; i < 6; i++) {
//     hash += letters[Math.floor(Math.random() * 16)];
//   }
//   return hash;
// }

//Color Generator with chroma js
function generateHex() {
  const hexColor = chroma.random();
  return hexColor;
}

function randomColor() {
  //IMPORTANT!!!
  initialColors = [];

  colorDivs.forEach((div, index) => {
    const hexText = div.children[0];
    const randomColor = generateHex();

    //Add it to the array
    // console.log(hexText.innerText);
    if (div.classList.contains("locked")) {
      initialColors.push(hexText.innerText);
      return;
    } else {
      // console.log(chroma(randomColor).hex());
      initialColors.push(chroma(randomColor).hex());
      // console.log(randomColor.hex());
    }

    //add color to background
    div.style.backgroundColor = randomColor;
    hexText.innerText = randomColor;
    //check checkTextContrast
    checkTextContrast(randomColor, hexText);
    //Initial colorize sliders
    const color = chroma(randomColor);
    const sliders = div.querySelectorAll(".sliders input");
    const hue = sliders[0];
    const brightness = sliders[1];
    const saturation = sliders[2];

    colorizeSlider(color, hue, brightness, saturation);
  });

  //Reset Inputs
  resetInputs();

  adjustButton.forEach((adj, index) => {
    // console.log(adj, index);
    checkTextContrast(initialColors[index], adj);
    checkTextContrast(initialColors[index], lockButton[index]);
  });
}

function checkTextContrast(color, text) {
  const luminance = chroma(color).luminance();
  if (luminance > 0.5) {
    text.style.color = "black";
  } else {
    text.style.color = "white";
  }
}

function colorizeSlider(color, hue, brightness, saturation) {
  //scale saturation
  const noSat = color.set("hsl.s", 0);
  const fullSat = color.set("hsl.s", 1);
  const scaleSat = chroma.scale([noSat, color, fullSat]);
  //scale brightness
  const midBright = color.set("hsl.l", 0.5);
  const scaleBright = chroma.scale(["black", midBright, "white"]);

  //Update Input Color
  saturation.style.backgroundImage = `linear-gradient(to right, 
                                      ${scaleSat(0)}, 
                                      ${scaleSat(1)})`;

  brightness.style.backgroundImage = `linear-gradient(to right, 
                                        ${scaleBright(0)},
                                        ${scaleBright(0.5)},
                                        ${scaleBright(1)})`;

  hue.style.backgroundImage = `linear-gradient(to right, 
    rgb(204, 75, 75), 
    rgb(204, 204, 75), 
    rgb(75, 204, 75), 
    rgb(75, 204, 204),
    rgb(75, 75, 204),
    rgb(204, 75, 204),
    rgb(204, 75, 75))`;
}

function hslControls(e) {
  // console.log(e);
  const index =
    e.target.getAttribute("data-bright") ||
    e.target.getAttribute("data-sat") ||
    e.target.getAttribute("data-hue");
  // console.log(index);

  // console.log(e.target.parentElement);
  let sliders = e.target.parentElement.querySelectorAll('input[type="range');
  // console.log(sliders);
  const hue = sliders[0];
  const brightness = sliders[1];
  const saturation = sliders[2];

  const bgColor = initialColors[index];
  // console.log(`initialArr: ${bgColor}`);

  let color = chroma(bgColor)
    .set("hsl.s", saturation.value)
    .set("hsl.l", brightness.value)
    .set("hsl.h", hue.value);

  colorDivs[index].style.backgroundColor = color;

  // colorize Slider/input
  colorizeSlider(color, hue, brightness, saturation);
}

function updateTextUI(index) {
  const activeDiv = colorDivs[index];
  const color = chroma(activeDiv.style.backgroundColor);
  // console.log(color);
  const textHex = activeDiv.querySelector("h2");
  const icons = activeDiv.querySelectorAll(".controls button");

  textHex.innerText = color.hex();
  //check contrast
  checkTextContrast(color, textHex);
  for (icon of icons) {
    checkTextContrast(color, icon);
  }
}

function resetInputs() {
  const sliders = document.querySelectorAll(".sliders input");
  sliders.forEach((slider) => {
    if (slider.name === "hue") {
      const hueColor = initialColors[slider.getAttribute("data-hue")];
      const hueValue = chroma(hueColor).hsl()[0];
      // console.log(hueValue);
      slider.value = Math.floor(hueValue);
    }
    if (slider.name === "brightness") {
      const brightColor = initialColors[slider.getAttribute("data-bright")];
      const brightValue = chroma(brightColor).hsl()[2];
      // console.log(hueValue);
      slider.value = Math.floor(brightValue * 100) / 100;
    }
    if (slider.name === "saturation") {
      const satColor = initialColors[slider.getAttribute("data-sat")];
      const satValue = chroma(satColor).hsl()[1];
      // console.log(hueValue);
      slider.value = Math.floor(satValue * 100) / 100;
    }
  });
}

function copyToClipboard(hex) {
  const el = document.createElement("textarea");
  el.value = hex.innerText;
  document.body.appendChild(el);
  el.select();
  document.execCommand("copy");
  document.body.removeChild(el);

  // const popupBox = copyContainer.children[0];
  copyContainer.classList.add("active");
  copyPopup.classList.add("active");
}

//LOCAL STORAGE

//implement save to palette and Local Storage
const saveButton = document.querySelector(".save");
const submitSave = document.querySelector(".submit-save");
const closeSave = document.querySelector(".close-save");
const saveContainer = document.querySelector(".save-container");
const saveInput = document.querySelector(".save-container input");

const libraryButton = document.querySelector(".library");
const closeLibrary = document.querySelector(".close-library");
const libraryContainer = document.querySelector(".library-container");
const libraryPopup = document.querySelector(".library-popup");

saveButton.addEventListener("click", openPalette);
closeSave.addEventListener("click", closePalette);
submitSave.addEventListener("click", savePalette);
libraryButton.addEventListener("click", openLibrary);
closeLibrary.addEventListener("click", closeLibraryPanel);

function openPalette() {
  const popup = saveContainer.children[0];
  saveContainer.classList.add("active");
  popup.classList.add("active");
}
function closePalette() {
  const popup = saveContainer.children[0];
  saveContainer.classList.remove("active");
  popup.classList.remove("active");
}
function savePalette() {
  const popup = saveContainer.children[0];
  saveContainer.classList.remove("active");
  popup.classList.remove("active");
  const name = saveInput.value;
  const colors = [];
  currentHexes.forEach((hex) => {
    colors.push(hex.innerText);
  });
  //Generate Object
  let paletteNum = savePalettes.length;
  //check something already exists in localPalettes
  const paletteObjects = JSON.parse(localStorage.getItem("palettes"));
  if (paletteObjects) {
    paletteNum = paletteObjects.length;
  } else {
    paletteNum = savePalettes.length;
  }
  const paletteObj = { name, colors, num: paletteNum };
  savePalettes.push(paletteObj);
  // console.log(savePalettes);
  saveToLocal(paletteObj);
  saveInput.value = "";

  //Generate palette for Library
  const palette = document.createElement("div");
  palette.classList.add("custom-palette");
  const title = document.createElement("h4");
  title.innerText = paletteObj.name;
  const preview = document.createElement("div");
  preview.classList.add("small-preview");
  paletteObj.colors.forEach((smallColor) => {
    const smallDiv = document.createElement("div");
    smallDiv.style.backgroundColor = smallColor;
    preview.appendChild(smallDiv);
  });
  const paletteButton = document.createElement("button");
  paletteButton.classList.add("pick-palette-btn");
  paletteButton.classList.add(paletteObj.num);
  paletteButton.innerText = "select";

  //Attach event
  paletteButton.addEventListener("click", (e) => {
    closeLibraryPanel();
    const paletteIndex = e.target.classList[1];
    initialColors = [];
    savePalettes[paletteIndex].colors.forEach((color, index) => {
      initialColors.push(color);
      colorDivs[index].style.backgroundColor = color;
      const text = colorDivs[index].children[0];
      checkTextContrast(color, text);
      updateTextUI(index);
    });
    resetInputs();
  });

  //Append to Library
  palette.appendChild(title);
  palette.appendChild(preview);
  palette.appendChild(paletteButton);
  libraryContainer.children[0].appendChild(palette);
}

function saveToLocal(paletteObj) {
  let localPalettes;
  if (localStorage.getItem("palettes") === null) {
    localPalettes = [];
  } else {
    localPalettes = JSON.parse(localStorage.getItem("palettes"));
  }
  localPalettes.push(paletteObj);
  localStorage.setItem("palettes", JSON.stringify(localPalettes));
}

function openLibrary() {
  const popup = libraryContainer.children[0];
  libraryContainer.classList.add("active");
  popup.classList.add("active");
}
function closeLibraryPanel() {
  const popup = libraryContainer.children[0];
  libraryContainer.classList.remove("active");
  popup.classList.remove("active");
}

function getLocal() {
  if (localStorage.getItem("palettes") === null) {
    localPalettes = [];
  } else {
    const paletteObjects = JSON.parse(localStorage.getItem("palettes"));

    savePalettes = [...paletteObjects];

    paletteObjects.forEach((paletteObj) => {
      //Generate palette for Library
      const palette = document.createElement("div");
      palette.classList.add("custom-palette");
      const title = document.createElement("h4");
      title.innerText = paletteObj.name;
      const preview = document.createElement("div");
      preview.classList.add("small-preview");
      paletteObj.colors.forEach((smallColor) => {
        const smallDiv = document.createElement("div");
        smallDiv.style.backgroundColor = smallColor;
        preview.appendChild(smallDiv);
      });
      const paletteButton = document.createElement("button");
      paletteButton.classList.add("pick-palette-btn");
      paletteButton.classList.add(paletteObj.num);
      paletteButton.innerText = "select";

      //Attach event
      paletteButton.addEventListener("click", (e) => {
        closeLibraryPanel();
        const paletteIndex = e.target.classList[1];
        initialColors = [];
        paletteObjects[paletteIndex].colors.forEach((color, index) => {
          initialColors.push(color);
          colorDivs[index].style.backgroundColor = color;
          const text = colorDivs[index].children[0];
          checkTextContrast(color, text);
          updateTextUI(index);
        });
        resetInputs();
      });

      //Append to Library
      palette.appendChild(title);
      palette.appendChild(preview);
      palette.appendChild(paletteButton);
      libraryContainer.children[0].appendChild(palette);
    });
  }
}

const clearButton = document.createElement("button");
clearButton.classList.add("clear");
clearButton.innerText = "Clear";
libraryPopup.appendChild(clearButton);

clearButton.addEventListener("click", () => {
  localStorage.clear();
  const palettes = libraryPopup.querySelectorAll(".custom-palette");
  palettes.forEach((palette) => {
    palette.remove();
  });
});

getLocal();
randomColor();
