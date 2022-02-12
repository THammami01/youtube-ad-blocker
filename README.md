# YoutubeAdBlocker

To skip the video ad, run this JS code:

```js
const video = document.getElementsByClassName('video-stream')[0];
const skipButton = document.getElementsByClassName('ytp-ad-skip-button')[0];
video.currentTime = video.duration;
skipButton.click();
```

When the extension's icon is clicked, this line of code will be run and the ad will be skipped.

```js
document.getElementsByClassName('ytp-ad-skip-button')[0].click()
```
