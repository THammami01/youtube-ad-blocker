const blockAd = () => {
  const skipBtn = document.getElementsByClassName("ytp-ad-skip-button")[0];
  if (skipBtn) {
    console.log("SKIP AD BUTTON FOUND");
    skipBtn.click();
  } else console.log("SKIP AD BUTTON NOT FOUND");
};

chrome.action.onClicked.addListener((tab) => {
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    function: blockAd,
  });
});
