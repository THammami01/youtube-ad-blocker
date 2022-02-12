# YoutubeAdBlocker

To skip the video ad, run this JS code

```js
const video = document.getElementsByClassName('video-stream')[0];
const skipButton = document.getElementsByClassName('ytp-ad-skip-button')[0];
video.currentTime = video.duration;
skipButton.click();
```

This one-liner is a working solution for the meantime

```js
setInterval(() => document.getElementsByClassName('ytp-ad-skip-button')[0].click(), 100);
```
