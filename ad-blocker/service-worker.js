// chrome.action.onClicked.addListener((tab) => {
//   chrome.scripting.executeScript({
//     target: { tabId: tab.id },
//     function: blockAds,
//   });
// });

const ItemsEnum = {
  VIDEOS_SKIPPED: "VIDEOS_SKIPPED",
  MINUTES_SAVED: "MINUTES_SAVED",
};

const MessageTypeEnum = {
  SKIPPED_AD_DATA: "SKIPPED_AD_DATA",
  PAGE_RELOAD_REQUEST: "PAGE_RELOAD_REQUEST",
  EXTENSION_STATE_REQUEST: "EXTENSION_STATE_REQUEST",
  EXTENSION_STATE_RESPONSE: "EXTENSION_STATE_RESPONSE",
};

const initialData = {
  enabled: true,
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
    "REQUEST RECEIVED " + sender.tab
      ? "FROM A CONTENT SCRIPT: " + sender.tab.url
      : "FROM THE EXTENSION"
  );

  console.info(request?.messageType);

  switch (request?.messageType) {
    case MessageTypeEnum.SKIPPED_AD_DATA:
      chrome.storage.local.get(["savedData"], ({ savedData }) => {
        if (savedData) savedData = JSON.parse(savedData);
        else savedData = initialData;

        if (request.skippedAdData.duration) {
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

      break;

    case MessageTypeEnum.EXTENSION_STATE_REQUEST:
      chrome.storage.local.get(["savedData"], ({ savedData }) => {
        if (savedData) savedData = JSON.parse(savedData);
        else {
          savedData = initialData;b
          // SAVE DATA IN LOCAL STORAGE
          saveData(savedData);
        }

        chrome.tabs.sendMessage(sender.tab.id, {
          messageType: MessageTypeEnum.EXTENSION_STATE_RESPONSE,
          isExtensionEnabled: savedData.isExtensionEnabled,
        });
      });

      break;

    default:
      break;
  }

  sendResponse();
});
