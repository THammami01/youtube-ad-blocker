const blockAd = () => {
  const video = document.getElementsByClassName('video-stream')[0];
  if (video) video.currentTime = video.duration;
  document.getElementsByClassName('ytp-ad-skip-button')[0]?.click();
};

chrome.action.onClicked.addListener((tab) => {
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    function: blockAd,
  });
});
