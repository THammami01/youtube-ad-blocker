// chrome.action.onClicked.addListener((tab) => {
//   chrome.scripting.executeScript({
//     target: { tabId: tab.id },
//     function: blockAds,
//   });
// });

// chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
//   // console.info(
//   //   sender.tab
//   //     ? "From a content script: " + sender.tab.url
//   //     : "From the extension."
//   // );

//   let skippedAdData;
//   chrome.storage.local.get(["skippedAdData"], (res) => {
//     skippedAdData = res.skippedAdData;
//   });

//   chrome.storage.local.set(
//     { skippedAdData: JSON.stringify(request?.skippedAdData) },
//     () => {}
//   );

//   sendResponse({
//     status: "RECEIVED FROM SERVICE WORKER",
//     skippedAdData: request?.skippedAdData,
//   });
// });

// let count = 0;
// chrome.storage.local.get(["count"], (res) => {
//   count = res.count;
// });

// setInterval(() => {
//   chrome.storage.local.set({ count: ++count }, () => {
//     console.info("COUNT: " + count);
//   });
// }, 1000);

const Items = {
  videosSkipped: 0,
  minutesSaved: 1,
};

const initialData = {
  enabled: true,
  itemsShown: Items.videosSkipped,
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

const getSecondsFromFormattedDuration = (duration) => {
  console.info("FORMATTED: ", duration);
  const durationArr = duration.split(":");
  return parseInt(durationArr[0]) * 60 + parseInt(durationArr[1]);
};

const getMinutesFromSeconds = (seconds) => {
  return Math.ceil(seconds / 60);
};

// SAVE DATA IN LOCAL STORAGE
const saveData = (data) => {
  chrome.storage.local.set({ savedData: JSON.stringify(data) }, (_res) => {});
};

// LISTEN FOR MESSAGES FROM content-script.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.info(
    sender.tab
      ? "From a content script: " + sender.tab.url
      : "From the extension."
  );

  console.info("REQUEST DATA:");
  console.info(request?.skippedAdData);

  if (request?.skippedAdData) {
    chrome.storage.local.get(["savedData"], ({ savedData }) => {
      if (savedData) savedData = JSON.parse(savedData);
      else savedData = initialData;

      if (request?.skippedAdData.duration) {
        savedData.minutesSaved.totalInSeconds +=
          getSecondsFromFormattedDuration(request.skippedAdData.duration);
        savedData.minutesSaved.total = getMinutesFromSeconds(
          savedData.minutesSaved.totalInSeconds
        );
      }
      savedData.videosSkipped.total++;

      // SAVE DATA IN LOCAL STORAGE
      saveData(savedData);
    });
  }

  sendResponse();
});
