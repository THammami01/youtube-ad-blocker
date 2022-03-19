const blockAd = async () => {
  // ==== START OF SOLUTION FROM STACKOVERFLOW ====
  // https://stackoverflow.com/a/47776379/11542205
  // waitForElements WAITS FOR SPECIFIC ELEMENTS TO APPEAR
  const rafAsync = () => {
    return new Promise((resolve) => {
      requestAnimationFrame(resolve);
    });
  };

  const waitForElements = async (selector) => {
    let querySelector = null;
    while (querySelector === null) {
      await rafAsync();
      querySelector = document.querySelector(selector);
    }
    return querySelector;
  };
  // ===== END OF SOLUTION FROM STACKOVERFLOW =====

  // ACTIONS ARE EITHER TO CLICK ON THE SKIP BTN OR TO REMOVE AN AD ELEMENT
  const Action = {
    click: 0,
    remove: 1,
  };

  // Document.prototype.removeElementsByClassName = (selector) =>
  //   [...document.getElementsByClassName(selector)].forEach(
  //     (el) => (el.style.display = "none")
  //   );

  const removeElementsByClassName = (elements) =>
    [...elements].forEach((el) => (el.style.display = "none"));

  const setTimeoutHandler = (selector, action) => async () => {
    try {
      const elements = await waitForElements(selector);

      console.info(`${selector} - ${action}`);

      switch (action) {
        case Action.click:
          elements[0].click();
        case Action.remove:
          removeElementsByClassName(elements);
        default:
          break;
      }

      setTimeoutHandler();
    } catch (err) {
      console.error(err);
    }
  };

  // CLICK ON THE SKIP AD BTN
  setTimeout(setTimeoutHandler("ytp-ad-skip-button", Action.click), 0);
  // REMOVE THE AD THAT HAS A TRANSPARENT BLACK BG AND APPEARS DURING THE VIDEO
  setTimeout(setTimeoutHandler("ytp-ad-text-overlay", Action.remove), 0);
  // REMOVE THE AD THAT APPEARS ABOVE THE SUGGESTED NEXT VIDEOS
  setTimeout(
    setTimeoutHandler("ytd-companion-slot-renderer", Action.remove),
    0
  );
  // REMOVE THE AD THAT APPEARS IN THE HOMEPAGE
  setTimeout(setTimeoutHandler("ytd-display-ad-renderer", Action.remove), 0);

  setTimeout(
    setTimeoutHandler("ytd-subscribe-button-renderer", Action.remove),
    0
  );
};

chrome.action.onClicked.addListener((tab) => {
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    function: blockAd,
  });
});
