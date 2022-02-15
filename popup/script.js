const MessageTypeEnum = {
  SKIPPED_AD_DATA: "SKIPPED_AD_DATA",
  PAGE_RELOAD_REQUEST: "PAGE_RELOAD_REQUEST",
  EXTENSION_STATE_REQUEST: "EXTENSION_STATE_REQUEST",
  EXTENSION_STATE_RESPONSE: "EXTENSION_STATE_RESPONSE",
};

const ItemsEnum = {
  VIDEOS_SKIPPED: "VIDEOS_SKIPPED",
  MINUTES_SAVED: "MINUTES_SAVED",
};

const initialData = {
  isExtensionEnabled: true,
  itemsShown: ItemsEnum.VIDEOS_SKIPPED,
  videosSkipped: {
    today: 0,
    week: 0,
    month: 0,
    total: 0,
  },
  minutesSaved: {
    today: 0,
    week: 0,
    month: 0,
    total: 0,
    totalInSeconds: 0,
  },
};

// SAVE DATA IN LOCAL STORAGE
const saveData = (data) => {
  chrome.storage.local.set({ savedData: JSON.stringify(data) }, (_res) => {});
};

// UPDATE DATA DISPLAYED IN THE POPUP
const updateUI = (data) => {
  document.getElementById("isExtensionEnabledCb").checked =
    data.isExtensionEnabled;

  if (data.itemsShown === ItemsEnum.VIDEOS_SKIPPED) {
    document.getElementById("minutes").classList.remove("selected");
    document.getElementById("videos").classList.add("selected");

    document.getElementById("total-count").innerText = data.videosSkipped.total;
    document.getElementById("total-count-desc").innerText = "Videos Skipped";
    document.getElementById("today-count").innerText = data.videosSkipped.today;
    document.getElementById("this-week-count").innerText =
      data.videosSkipped.week;
    document.getElementById("this-month-count").innerText =
      data.videosSkipped.month;
    [...document.getElementsByClassName("count-type")].forEach(
      (el) => (el.innerText = "videos")
    );
  } else {
    document.getElementById("videos").classList.remove("selected");
    document.getElementById("minutes").classList.add("selected");

    document.getElementById("total-count").innerText = data.minutesSaved.total;
    document.getElementById("total-count-desc").innerText = "Minutes Saved";
    document.getElementById("today-count").innerText = data.minutesSaved.today;
    document.getElementById("this-week-count").innerText =
      data.minutesSaved.week;
    document.getElementById("this-month-count").innerText =
      data.minutesSaved.month;
    [...document.getElementsByClassName("count-type")].forEach(
      (el) => (el.innerText = "minutes")
    );
  }
};

// GET SECONDS FROM FORMATTED DURATION (EXAMPLE: 1:20 => 80)
/*
const getSecondsFromFormattedDuration = (duration) => {
  console.info("FORMATTED: ", duration);
  const durationArr = duration.split(":");
  return parseInt(durationArr[0]) * 60 + parseInt(durationArr[1]);
};
*/

const askAllYoutubeTabsToReload = (isExtensionEnabled) => {
  chrome.tabs.query({}, (tabs) => {
    tabs
      .filter((tab) => tab.url.startsWith("https://www.youtube.com/"))
      .forEach((tab) =>
        chrome.tabs.sendMessage(tab.id, {
          messageType: MessageTypeEnum.PAGE_RELOAD_REQUEST,
          isExtensionEnabled: isExtensionEnabled,
        })
      );
  });
};

const main = () => {
  console.info("POPUP OPENED");

  let data = initialData;

  // INITIALIZE OR RESTORE DATA
  chrome.storage.local.get(["savedData"], ({ savedData }) => {
    if (savedData) data = JSON.parse(savedData);
    else saveData(data);
    updateUI(data);
  });

  document
    .getElementById("isExtensionEnabledCb")
    .addEventListener("change", (e) => {
      data.isExtensionEnabled = e.target.checked;
      updateUI(data);
      saveData(data);
      askAllYoutubeTabsToReload(e.target.checked);
    });

  document.getElementById("videos").addEventListener("click", () => {
    data.itemsShown = ItemsEnum.VIDEOS_SKIPPED;
    updateUI(data);
    saveData(data);
  });

  document.getElementById("minutes").addEventListener("click", () => {
    data.itemsShown = ItemsEnum.MINUTES_SAVED;
    saveData(data);
    updateUI(data);
  });

  document.getElementById("price-hero-link").addEventListener("click", () => {
    // OPENING LINKS FROM A CHROME EXTENSION REQUIRES USAGE OF THE CHROME TABS API
    chrome.tabs.create({ url: "https://www.pricehero.net/", active: true });
  });

  // LISTEN FOR MESSAGES FROM content-script.js
  /*
  chrome.runtime.onMessage.addListener((
    request,
    sender,
    sendResponse
  ) => {
    console.info(sender.tab ? "From a content script: " + sender.tab.url : "From the extension.");

    if (request?.skippedAdData) {
      data.minutesSaved.totalInSeconds += getSecondsFromFormattedDuration(
        request.skippedAdData.duration
      );
      data.videosSkipped.total++;
      updateUI(data);
      saveData(data);
    }

    sendResponse();
  });
  */

  // let isEnabled = 0;
  // setInterval(() => {
  //   isEnabled = !isEnabled;
  //   chrome.runtime.sendMessage({ isEnabled }, (res) => {
  //     console.info(res);
  //   });
  // }, 2000);
};

window.onload = main;
