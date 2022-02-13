const keepLooping = async () => {
  await new Promise((resolve, _reject) => {
    const videoPlayer = document.getElementById("movie_player");

    const setTimeoutHandler = () => {
      let ad = videoPlayer?.classList.contains("ad-interrupting");
      const nbOfSecondsSkipped = document.querySelector(
        ".ytp-ad-preview-text"
      )?.innerText;

      if (ad && nbOfSecondsSkipped) {
        console.info(`MAIN AD | ${nbOfSecondsSkipped} SECONDS SKIPPED`);
        // CLICK ON THE SKIP AD BTN
        document.querySelector(".ytp-ad-skip-button")?.click();
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
  keepLooping();
};

main();
