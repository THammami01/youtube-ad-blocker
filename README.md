# YoutubeAdBlocker

To skip the video ad, run this JS code:

```js
const video = document.getElementsByClassName('video-stream')[0];
const skipButton = document.getElementsByClassName('ytp-ad-skip-button')[0];
video.currentTime = video.duration;
skipButton.click();
```

This line of code is sufficient for skipping the 5s-must-watch type of ads.

```js
document.getElementsByClassName('ytp-ad-skip-button')[0].click()
```

The rest of the block is for skipping the unskippable ads..
We will know soon enough once they appear. 🎉
