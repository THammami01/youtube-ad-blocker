// SEND A MESSAGE TO ALL LISTENERS
const sendSkippedAdData = (skippedAdData) => {
  chrome.runtime.sendMessage({ skippedAdData }, (_res) => {
    console.info("MESSAGE SEND SUCCESSFULLY");
  });
};

const keepLooping = async () => {
  await new Promise((resolve, _reject) => {
    const videoPlayer = document.getElementById("movie_player");

    const setTimeoutHandler = () => {
      const ad = videoPlayer?.classList.contains("ad-interrupting");
      const secondsSkipped = document.querySelector(
        ".ytp-ad-preview-text"
      )?.innerText;
      const duration = document.querySelector(".ytp-time-duration")?.innerText;

      if (ad && secondsSkipped && duration !== "0:00") {
        console.info(`MAIN AD | ${secondsSkipped} SECONDS SKIPPED`);
        // CLICK ON THE SKIP AD BTN
        document.querySelector(".ytp-ad-skip-button")?.click();
        sendSkippedAdData({ secondsSkipped, duration });
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
