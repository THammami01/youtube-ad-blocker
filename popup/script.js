// SOLUTION LINK: https://stackoverflow.com/a/37334083/11542205
const getFirstDayOfWeek = (fromDate) => {
  const dayLength = 24 * 60 * 60 * 1000;

  const currentDate = new Date(
    fromDate.getFullYear(),
    fromDate.getMonth(),
    fromDate.getDate()
  );

  const currentWeekDayMillisecond = currentDate.getDay() * dayLength;

  let monday = new Date(
    currentDate.getTime() - currentWeekDayMillisecond + dayLength
  );

  if (monday > currentDate) monday = new Date(monday.getTime() - dayLength * 7);
  return monday;
};

const getTimestamps = () => {
  const now = new Date();

  // ! TIMEZONES
  return {
    // current: now.getTime(), // GET CURRENT TIMESTAMP: Date.now() OR new Date().getTime()
    today: new Date(new Date(now).setHours(0, 0, 0, 0)).getTime(),
    firstDayOfWeek: getFirstDayOfWeek(now).getTime(),
    firstDayOfMonth: new Date(now.getFullYear(), now.getMonth(), 1).getTime(),
  };
};

const getMinutesFromSeconds = (seconds) => {
  // Math.ceil() GIVES INSTANT FEEDBACK FROM THE FIRST SKIPPED VIDEO, INSTEAD OF Math.round()
  return Math.ceil(seconds / 60);
};

const getStats = (skippedAdsLogs) => {
  const { today, firstDayOfWeek, firstDayOfMonth } = getTimestamps();

  console.info("TIMESTAMPS");
  console.info(today, firstDayOfWeek, firstDayOfMonth);

  console.info("SKIPPED ADS LOGS");
  console.info(skippedAdsLogs);

  const stats = {
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

  skippedAdsLogs.forEach(([adTimestamp, adSeconds]) => {
    if (today <= adTimestamp) {
      stats.videosSkipped.today++;
      stats.minutesSaved.today += adSeconds;
    } else if (firstDayOfWeek <= adTimestamp) {
      stats.videosSkipped.week++;
      stats.minutesSaved.week += adSeconds;
    } else if (firstDayOfMonth <= adTimestamp) {
      stats.videosSkipped.month++;
      stats.minutesSaved.month += adSeconds;
    } else {
      stats.minutesSaved.total += adSeconds;
    }
  });

  stats.videosSkipped.week += stats.videosSkipped.today;
  stats.videosSkipped.month += stats.videosSkipped.week;
  stats.videosSkipped.total = skippedAdsLogs.length;

  stats.minutesSaved.week += stats.minutesSaved.today;
  stats.minutesSaved.month += stats.minutesSaved.week;
  stats.minutesSaved.total += stats.minutesSaved.month;

  // TURN SECONDS INTO MINUTES
  stats.minutesSaved.today = getMinutesFromSeconds(stats.minutesSaved.today);
  stats.minutesSaved.week = getMinutesFromSeconds(stats.minutesSaved.week);
  stats.minutesSaved.month = getMinutesFromSeconds(stats.minutesSaved.month);
  stats.minutesSaved.total = getMinutesFromSeconds(stats.minutesSaved.total);

  return stats;
};

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
  },
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

// UPDATE DATA DISPLAYED IN THE POPUP
const updateUI = (data) => {
  document.getElementById("isExtensionEnabledCb").checked =
    data.isExtensionEnabled;
  document.getElementById("isExtensionEnabledLbl").title =
    data.isExtensionEnabled ? "Switch Off" : "Switch On";

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
  let skippedAdsLogs = [];

  // INITIALIZE OR RESTORE DATA
  chrome.storage.local.get(
    ["savedData", "savedSkippedAdsLogs"],
    ({ savedData, savedSkippedAdsLogs }) => {
      if (savedData) data = JSON.parse(savedData);
      // else saveData(data);
      if (savedSkippedAdsLogs) skippedAdsLogs = JSON.parse(savedSkippedAdsLogs);
      else updateSkippedAdsLogs(skippedAdsLogs);

      const { videosSkipped, minutesSaved } = getStats(skippedAdsLogs);
      console.info("STATS");
      console.info(videosSkipped);
      console.info(minutesSaved);
      data.videosSkipped = videosSkipped;
      data.minutesSaved = minutesSaved;
      saveData(data);
      updateUI(data);
    }
  );

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
