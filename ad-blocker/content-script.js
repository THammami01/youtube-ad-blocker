// SEND A MESSAGE TO ALL LISTENERS
const sendSkippedAdData = (skippedAdData) => {
  chrome.runtime.sendMessage({ skippedAdData }, (_res) => {
    console.info("MESSAGE SEND SUCCESSFULLY");
  });
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
    const videoPlayer = document.getElementById("movie_player");

    const setTimeoutHandler = () => {
      const isAd = videoPlayer?.classList.contains("ad-interrupting");
      const secondsSkipped = document.querySelector(
        ".ytp-ad-preview-text"
      )?.innerText;

      if (isAd && secondsSkipped) {
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
          // CLICK ON THE SKIP AD BTN
          document.querySelector(".ytp-ad-skip-button")?.click();
          sendSkippedAdData({ secondsSkipped, duration: durationType1 });
        }
        // APPEARS IN THE DOM ONLY WHEN AD TYPE 5 APPEARS
        if (durationType2 && durationType2 !== "0:00") {
          // CLICK ON THE SKIP AD BTN
          document.querySelector(".ytp-ad-skip-button")?.click();
          sendSkippedAdData({ secondsSkipped, duration: durationType2 });
        }
      }

      // REMOVE THE AD THAT APPEARS ABOVE THE SUGGESTED NEXT VIDEOS
      document.hideElementsBySelector(".ytd-companion-slot-renderer");
      // REMOVE THE AD THAT HAS A TRANSPARENT BLACK BG AND APPEARS DURING THE VIDEO
      document.hideElementsBySelector(".ytp-ad-text-overlay");
      // REMOVE THE AD THAT APPEARS IN THE HOMEPAGE
      document.hideElementsBySelector(".ytd-display-ad-renderer");

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

  keepLooping();
};

main();
