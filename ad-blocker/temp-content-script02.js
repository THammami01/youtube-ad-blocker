const blockAds = async () => {
  console.info("EXTENSION IS ON");

  // ==== START OF SOLUTION FROM STACKOVERFLOW ====
  // LINK: 
  // waitForElements WAITS FOR SPECIFIC ELEMENTS TO APPEAR IN THE DOM
  const waitForElements = (selector) => {
    return new Promise((resolve, _reject) => {
      const el = document.querySelector(selector);
      el && resolve(el);

      new MutationObserver((_mutationRecords, observer) => {
        Array.from(document.querySelectorAll(selector)).forEach((element) => {
          resolve(element);
          observer.disconnect();
        });
      }).observe(document.documentElement, {
        childList: true,
        subtree: true,
      });
    });
  };

  // document.querySelector("#movie_player").classList
  
  // ===== END OF SOLUTION FROM STACKOVERFLOW =====

  // ACTIONS ARE EITHER CLICKING ON AN ELEMENT OR REMOVING IT FROM THE DOM
  const Action = {
    click: 0,
    remove: 1,
  };

  Document.prototype.removeElementsBySelector = (selector) =>
    [...document.querySelectorAll(selector)].forEach(
      (el) =>
        // el.parentElement.removeChild(el)
        (el.style.display = "none")
    );

  const setTimeoutHandler = (params) => async () => {
    const { selectorToAppear, targetSelectors } = params;

    try {
      await waitForElements(selectorToAppear);

      console.info(`START: '${selectorToAppear}'`);

      targetSelectors.forEach(({ selector, action }) => {
        switch (action) {
          case Action.click:
            console.info(`CLICKING '${selector}'`);
            setTimeout(() => {
              console.info("0 CLICK IS RUN");
              document.querySelector(selector)?.click();
            }, 0);
            setTimeout(() => {
              console.info("50 CLICK IS RUN");
              document.querySelector(selector)?.click();
            }, 50);
            setTimeout(() => {
              console.info("100 CLICK IS RUN");
              document.querySelector(selector)?.click();
            }, 100);
            setTimeout(() => {
              console.info("150 CLICK IS RUN");
              document.querySelector(selector)?.click();
            }, 150);
            setTimeout(() => {
              console.info("200 CLICK IS RUN");
              document.querySelector(selector)?.click();
            }, 200);
            break;
          case Action.remove:
            console.info(`REMOVING '${selector}'`);
            document.removeElementsBySelector(selector);
            break;
          default:
            break;
        }
      });

      console.info(`END: '${selectorToAppear}'`);
      setTimeoutHandler(params);
    } catch (err) {
      console.error(`ERROR: '${selectorToAppear}'`);
      console.error(err);
    }
  };

  const paramsArr = [
    // REMOVE THE AD THAT APPEARS IN THE HOMEPAGE
    {
      selectorToAppear: ".ytd-display-ad-renderer",
      targetSelectors: [
        { selector: ".ytd-display-ad-renderer", action: Action.remove },
      ],
    },
    // CLICK ON THE SKIP AD BTN AND REMOVE THE AD THAT APPEARS ABOVE THE SUGGESTED NEXT VIDEOS
    {
      selectorToAppear: ".ytp-ad-visit-advertiser-button",
      targetSelectors: [
        { selector: ".ytp-ad-skip-button", action: Action.click },
        { selector: ".ytd-companion-slot-renderer", action: Action.remove },
      ],
    },
    // CLICK ON THE SKIP AD BTN AND REMOVE THE AD THAT APPEARS ABOVE THE SUGGESTED NEXT VIDEOS
    {
      selectorToAppear: ".ytd-companion-slot-renderer",
      targetSelectors: [
        { selector: ".ytp-ad-skip-button", action: Action.click },
        { selector: ".ytd-companion-slot-renderer", action: Action.remove },
      ],
    },
    // REMOVE THE AD THAT HAS A TRANSPARENT BLACK BG AND APPEARS DURING THE VIDEO
    {
      selectorToAppear: ".ytp-ad-overlay-container",
      targetSelectors: [
        { selector: ".ytp-ad-text-overlay", action: Action.remove },
      ],
    },
  ];

  paramsArr.forEach((params) => setTimeout(setTimeoutHandler(params), 0));
};

blockAds();
