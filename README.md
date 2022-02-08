# YoutubeAdBlocker
To skip the video ad, run this JS code

```js
const video = document.getElementsByClassName('video-stream')[0];
const skipButton = document.getElementsByClassName('ytp-ad-skip-button')[0];
video.currentTime = video.duration;
skipButton.click();
```
