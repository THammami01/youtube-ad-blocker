# YoutubeAdBlocker

To skip the video ad, run this JS code:

```js
const video = document.getElementsByClassName("video-stream")[0];
const skipButton = document.getElementsByClassName("ytp-ad-skip-button")[0];
video.currentTime = video.duration;
skipButton.click();
```

This line of code is sufficient for skipping the 5s-must-watch type of ads:

```js
document.getElementsByClassName("ytp-ad-skip-button")[0].click();
```

The rest of the block is for skipping the unskippable ads..
We will know soon enough once they appear. 🎉

The extension skips the main ad automatically now and hides all type of ads. ✅

## Notes

There are three scripts and here the utility of each one of them:

`script.js`

- contains the popup's logic
- gets data that are shown in the popup from the local storage

`service-worker.js`

- always running in the background
  - either active or inactive
  - no activity for ≈10 seconds turns it into inactive mode
  - Chrome runs the listener callback when a message is received so it becomes active again
- listens for messages from the content-script.js
- has access to the extension's local storage and does updates when a message is received

`content-script.js`

- injected in the Youtube website
- blocks all types of ads
  - skips the 5s-must-watch ads
  - removes all ads that are displayed
- sends messages (that contain the duration of a skipped ad each time) to the content-script

**NB:**

- All data are saved in local storage and that makes it a standalone app.
- The manifest is of V3 that can deployed to the Chrome Web Store without any editing.
- Code is formatted using Prettier default style guides.
- The components are taken from Flowbite UI that is based on Tailwind CSS.

## Todos

- Add enable/disable functionality.
- Add stats of the current day/week/month.
- In case the extension does not works properly when it is enabled/disabled, show an alert to confirm the reload of the page (I am not sure if this will work properly or not so this could be a simple solution).
