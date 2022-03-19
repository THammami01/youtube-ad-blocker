// chrome.action.onClicked.addListener((tab) => {
//   chrome.scripting.executeScript({
//     target: { tabId: tab.id },
//     function: blockAds,
//   });
// });

// RELOAD ALL YOUTUBE TABS WHEN THE EXTENSION IS INSTALLED OR UPDATED
chrome.runtime.onInstalled.addListener((details) => {
  switch (details.reason) {
    case "install":
      console.info("EXTENSION INSTALLED");
      break;
    case "update":
      console.info("EXTENSION UPDATED");
      break;
    case "chrome_update":
    case "shared_module_update":
    default:
      console.info("BROWSER UPDATED");
      break;
  }

  chrome.tabs.query({}, (tabs) => {
    tabs
      .filter((tab) => tab.url.startsWith("https://www.youtube.com/"))
      .forEach(({ id }) => {
        chrome.tabs.reload(id);
      });
  });
});

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
  },
};

const MessageTypeEnum = {
  SKIPPED_AD_DATA: "SKIPPED_AD_DATA",
  PAGE_RELOAD_REQUEST: "PAGE_RELOAD_REQUEST",
  EXTENSION_STATE_REQUEST: "EXTENSION_STATE_REQUEST",
  EXTENSION_STATE_RESPONSE: "EXTENSION_STATE_RESPONSE",
};

const getSecondsFromFormattedDuration = (duration) => {
  console.info("FORMATTED: ", duration);
  const durationArr = duration.split(":");
  return parseInt(durationArr[0]) * 60 + parseInt(durationArr[1]);
};

// SAVE DATA IN LOCAL STORAGE
const saveData = (data) => {
  chrome.storage.local.set({ savedData: JSON.stringify(data) }, (_res) => {});
};

const updateSkippedAdsLogs = (skippedAdsLogs) => {
  chrome.storage.local.set(
    { savedSkippedAdsLogs: JSON.stringify(skippedAdsLogs) },
    (_res) => {}
  );
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
      // skippedAdsLogs IS AN ARRAY OF ARRAYS
      // THE SUBARRAY CONTAINS A TIMESTAMP AND A SKIPPED AD DURATION IN SECONDS
      chrome.storage.local.get(
        ["savedSkippedAdsLogs"],
        ({ savedSkippedAdsLogs }) => {
          savedSkippedAdsLogs = savedSkippedAdsLogs
            ? JSON.parse(savedSkippedAdsLogs)
            : [];

          // if (request.skippedAdData.duration) {
          //   savedData.minutesSaved.totalInSeconds +=
          //     getSecondsFromFormattedDuration(request.skippedAdData.duration);
          //   savedData.minutesSaved.total = getMinutesFromSeconds(
          //     savedData.minutesSaved.totalInSeconds
          //   );
          // }
          // savedData.videosSkipped.total++;

          const timestamp = Date.now();
          let adDurationInSeconds;
          // SOMETIMES THE RECEIVED AD DURATION IS AN EMPTY STRING :/
          if (!request.skippedAdData.duration) adDurationInSeconds = 0;
          else
            adDurationInSeconds = getSecondsFromFormattedDuration(
              request.skippedAdData.duration
            );
          // ADD NEW SKIPPED AD TO THE LOGS TEMP ARRAY
          savedSkippedAdsLogs.push([timestamp, adDurationInSeconds]);

          console.info("ADDING NEW SKIPPED AD LOG TO");
          console.info(savedSkippedAdsLogs);

          // SAVE UPDATED LOGS IN LOCAL STORAGE
          updateSkippedAdsLogs(savedSkippedAdsLogs);
        }
      );

      break;

    case MessageTypeEnum.EXTENSION_STATE_REQUEST:
      chrome.storage.local.get(["savedData"], ({ savedData }) => {
        if (savedData) savedData = JSON.parse(savedData);
        else {
          savedData = initialData;
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
