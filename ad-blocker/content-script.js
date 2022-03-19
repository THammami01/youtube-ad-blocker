const MessageTypeEnum = {
  SKIPPED_AD_DATA: "SKIPPED_AD_DATA",
  PAGE_RELOAD_REQUEST: "PAGE_RELOAD_REQUEST",
  EXTENSION_STATE_REQUEST: "EXTENSION_STATE_REQUEST",
  EXTENSION_STATE_RESPONSE: "EXTENSION_STATE_RESPONSE",
};

// SEND SKIPPED AD DATA TO ALL LISTENERS (ONLY service-worker.js WILL RESPOND)
const sendSkippedAdData = (skippedAdData) => {
  chrome.runtime.sendMessage(
    { messageType: MessageTypeEnum.SKIPPED_AD_DATA, skippedAdData },
    (_res) => {
      console.info("SKIPPED AD DATA SENT SUCCESSFULLY");
    }
  );
};

// REQUEST EXTENSION STATE (ENABLED/DISABLED, ONLY service-worker.js WILL RESPOND)
const requestExtensionState = () => {
  chrome.runtime.sendMessage(
    { messageType: MessageTypeEnum.EXTENSION_STATE_REQUEST },
    (_res) => {
      console.info("EXTENSION_STATE_REQUEST DATA SENT SUCCESSFULLY");
    }
  );
};

// AD TYPES:
// TYPE 1: APPEARS IN THE HOMEPAGE
// TYPE 2: APPEARS ON TOP OF THE SUGGESTED LIST OF VIDEOS
// TYPE 3: APPEARS UNDER THE DESCRIPTION
// TYPE 4: SKIPPABLE 5-SECOND-MUST-BE-WATCHED VIDEO AD THAT APPEARS AT THE BEGINNING OF THE VIDEO, IN THE MIDDLE OR AT THE AD
// TYPE 5: SIMILAR TO TYPE 4 BUT 2 VIDEO ADS APPEAR IN ROW AND NOT ONLY ONE
// TYPE 6: UNSKIPPABLE 10-SECOND-MUST-BE-WATCHED VIDEO AD

const keepLooping = async () => {
  await new Promise((resolve, _reject) => {
    const videoContainer = document.getElementById("movie_player");

    const setTimeoutHandler = () => {
      const isAd = videoContainer?.classList.contains("ad-interrupting");
      const secondsSkipped = document.querySelector(
        ".ytp-ad-preview-text"
      )?.innerText;

      if (isAd && secondsSkipped) {
        const videoPlayer = document.getElementsByClassName("video-stream")[0];

        // FOR AD TYPE 4
        const durationType1 =
          document.querySelector(".ytp-time-duration")?.innerText;
        // FOR AD TYPE 5
        const durationType2 = document.getElementById("ad-text:i")?.innerText;
        // FOR AD TYPE 6
        // const durationType3 = ...;

        // CHECKING IF IT IS NOT EQUAL TO 0:00 INTEAD OF IF ITS TRUTHINESS
        // BECAUSE IT IS ALWAYS IN THE DOM AND EQUALS TO 0:00
        // CHANGES ONLY WHEN AD TYPE 4 APPEARS
        if (durationType1 !== "0:00") {
          if (videoPlayer && videoPlayer.duration)
            videoPlayer.currentTime = videoPlayer.duration;
          // CLICK ON THE SKIP AD BTN
          document.querySelector(".ytp-ad-skip-button")?.click();
          sendSkippedAdData({ secondsSkipped, duration: durationType1 });
        }
        // APPEARS IN THE DOM ONLY WHEN AD TYPE 5 APPEARS
        if (durationType2 && durationType2 !== "0:00") {
          if (videoPlayer && videoPlayer.duration)
            videoPlayer.currentTime = videoPlayer.duration;
          // CLICK ON THE SKIP AD BTN
          document.querySelector(".ytp-ad-skip-button")?.click();
          sendSkippedAdData({ secondsSkipped, duration: durationType2 });
        }
      }

      // REMOVE THE AD THAT APPEARS ABOVE THE SUGGESTED NEXT VIDEOS
      // -- AD RELATED TO THE SKIPPED VIDEO
      document.hideElementsBySelector(".ytd-companion-slot-renderer");
      // -- AD NOT RELATED TO SKIPPED VIDEO
      document.hideElementsBySelector(".ytd-watch-next-secondary-results-renderer.sparkles-light-cta");
      // -- SIMILAR TO THE PREVIOUS ONE BUT DIFFERENT COMPONENT
      document.hideElementsBySelector(".ytd-unlimited-offer-module-renderer");
      // REMOVE THE AD THAT HAS A TRANSPARENT BLACK BG AND APPEARS DURING THE VIDEO
      document.hideElementsBySelector(".ytp-ad-overlay-image")
      document.hideElementsBySelector(".ytp-ad-text-overlay");
      // REMOVE ADS THAT APPEARS IN THE HOMEPAGE
      // -- AD THAT LOOKS LIKE A REGULAR VIDEO
      document.hideElementsBySelector(".ytd-display-ad-renderer");
      // -- AD THAT DISPLAYS IN THE MIDDLE OF THE PAGE
      document.hideElementsBySelector(".ytd-statement-banner-renderer");
      // -- SUBSCRIBE FOR PREMIUM
      document.hideElementsBySelector(".ytd-banner-promo-renderer");
      // -- LOOKS SIMILAR TO SUBSCRIBE FOR PREMIUM BUT FOR A DIFFERENT ADVERTISER
      document.hideElementsBySelector(".ytd-video-masthead-ad-v3-renderer");
      // -- YOUTUBE TV AD
      document.hideElementsBySelector(".ytd-primetime-promo-renderer");
      resolve();
    };

    // RUN IT ONLY AFTER 100 MILLISECONDS
    setTimeout(setTimeoutHandler, 100);
  });

  keepLooping();
};

const main = async () => {
  Document.prototype.hideElementsBySelector = (selector) =>
    [...document.querySelectorAll(selector)].forEach(
      (el) => (el.style.display = "none")
      // el.parentElement.removeChild(el)
    );

  console.info("EXTENSION IS ON");

  // TEST IT WITHOUT WAITING FOR THE AD
  // sendSkippedAdData({ secondsSkipped: "5", duration: "2:00" });

  requestExtensionState();

  // TEST RECEIVING MESSAGES FROM script.js OR service-worker.js
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.info(
      sender.tab
        ? "From a content script: " + sender.tab.url
        : "From the extension."
    );

    console.info("TYPE OF THE RECEIVED MESSAGE:");
    console.info(request?.messageType);

    switch (request?.messageType) {
      case MessageTypeEnum.PAGE_RELOAD_REQUEST:
        const msg = `Youtube Ad Blocker is turned ${
          request.isExtensionEnabled ? "on" : "off"
        }. Every Youtube tab is going to be reloaded in order for the extension to work properly.`;

        // WORKS WITH THE ACTIVE TAB ONLY
        // if (confirm(msg)) location.reload();
        // WORKS WITH ALL TABS IN ALL WINDOWS
        alert(msg);
        location.reload();
      case MessageTypeEnum.EXTENSION_STATE_RESPONSE:
        if (request.isExtensionEnabled) {
          keepLooping();
          console.info("LOOPING");
        } else console.info("NOT LOOPING");
    }
  });
};

main();
