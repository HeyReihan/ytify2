import { audio, playButton, queuelist } from "../lib/dom";
import player from "../lib/player";
import { convertSStoHHMMSS, params } from "../lib/utils";
import { appendToQueuelist, firstItemInQueue } from "./queue";



const streamHistory: string[] = [];

const playSpeed = <HTMLSelectElement>document.getElementById('playSpeed');
const seekBwdButton = <HTMLButtonElement>document.getElementById('seekBwdButton');
const seekFwdButton = <HTMLButtonElement>document.getElementById('seekFwdButton');
const progress = <HTMLInputElement>document.getElementById('progress');
const currentDuration = <HTMLParagraphElement>document.getElementById('currentDuration');
const fullDuration = <HTMLParagraphElement>document.getElementById('fullDuration');
const playPrevButton = <HTMLButtonElement>document.getElementById('playPrevButton');
const playNextButton = <HTMLButtonElement>document.getElementById('playNextButton');
const loopButton = <HTMLButtonElement>document.getElementById('loopButton');
const volumeChanger = <HTMLInputElement>document.getElementById('volumeChanger');
const volumeIcon = <HTMLLabelElement>volumeChanger.previousElementSibling;


const msn = 'mediaSession' in navigator;
const ms = msn ? navigator.mediaSession : playButton.dataset;
function updatePositionState() {
  if (msn)
    if ('setPositionState' in navigator.mediaSession)
      navigator.mediaSession.setPositionState({
        duration: audio.duration,
        playbackRate: audio.playbackRate,
        position: audio.currentTime,
      });
}



playButton.addEventListener('click', () => {
  if (!audio.dataset.id) return;
  ms.playbackState === 'playing' ?
    audio.pause() :
    audio.play();
});


audio.addEventListener('playing', () => {
  playButton.classList.replace(playButton.className, 'ri-pause-circle-fill');
  ms.playbackState = 'playing';
  const id = <string>audio.dataset.id;
  if (!streamHistory.includes(id))
    streamHistory.push(id);
});

audio.addEventListener('pause', () => {
  playButton.classList.replace('ri-pause-circle-fill', 'ri-play-circle-fill');
  ms.playbackState = 'paused';
});


let isPlayable = false;
const playableCheckerID = setInterval(() => {
  if (streamHistory.length || params.has('url') || params.has('text') || !params.has('s')) {
    isPlayable = true;
    clearInterval(playableCheckerID);
  }
}, 500);


audio.addEventListener('loadeddata', () => {
  playButton.classList.replace('ri-loader-3-line', 'ri-play-circle-fill');
  if (isPlayable) audio.play();

  // persist playback speed
  if (playSpeed.value !== '1.00')
    audio.playbackRate = parseFloat(playSpeed.value);

});


audio.addEventListener('waiting', () => {
  playButton.classList.replace(playButton.className, 'ri-loader-3-line');
});


playSpeed.addEventListener('change', () => {
  const speed = parseFloat(playSpeed.value);

  if (speed < 0 || speed > 4)
    return;

  audio.playbackRate = speed;
  updatePositionState();
  playSpeed.blur();
});



seekFwdButton.addEventListener('click', () => {
  audio.currentTime += 15;
  updatePositionState();
});


seekBwdButton.addEventListener('click', () => {
  audio.currentTime -= 15;
  updatePositionState();
});


progress.addEventListener('change', () => {
  const value = parseInt(progress.value);

  if (value < 0 || value > audio.duration)
    return;

  audio.currentTime = value;
  progress.blur();
});

audio.addEventListener('timeupdate', () => {
  if (progress === document.activeElement)
    return;

  const seconds = Math.floor(audio.currentTime);

  progress.value = seconds.toString();
  currentDuration.textContent = convertSStoHHMMSS(seconds);

});


audio.addEventListener('loadedmetadata', () => {
  progress.value = '0';
  progress.min = '0';
  progress.max = Math.floor(audio.duration).toString();
  fullDuration.textContent = convertSStoHHMMSS(audio.duration);
});


loopButton.addEventListener('click', () => {
  loopButton.classList.toggle('on');
  audio.loop = !audio.loop;
});



playPrevButton.addEventListener('click', () => {
  if (streamHistory.length > 1) {
    appendToQueuelist(audio.dataset, true);
    streamHistory.pop();
    player(streamHistory[streamHistory.length - 1]);
  }
})



function onEnd() {
  playButton.classList.replace(playButton.className, 'ri-stop-circle-fill');
  if (queuelist.childElementCount)
    firstItemInQueue().click();
}

audio.addEventListener('ended', onEnd);

playNextButton.addEventListener('click', onEnd);


volumeIcon.addEventListener('click', () => {
  volumeChanger.value = audio.volume ? '0' : '100';
  audio.volume = audio.volume ? 0 : 1;
  volumeIcon.classList.replace(
    volumeIcon.className,
    `ri-volume-${volumeIcon.className.includes('mute') ? 'up' : 'mute'
    }-fill`
  );
});

volumeChanger.addEventListener('input', () => {
  audio.volume = parseFloat(volumeChanger.value) / 100;
  volumeIcon.classList.replace(
    volumeIcon.className,
    audio.volume ?
      `ri-volume-${audio.volume > 0.5 ? 'up' : 'down'}-fill` :
      'ri-volume-mute-fill');
});



if (msn) {
  navigator.mediaSession.setActionHandler('play', () => {
    audio.play();
    ms.playbackState = 'playing';
  });
  navigator.mediaSession.setActionHandler('pause', () => {
    audio.pause();
    ms.playbackState = 'paused'
  });
  navigator.mediaSession.setActionHandler("seekforward", () => {
    audio.currentTime += 15;
    updatePositionState();
  });
  navigator.mediaSession.setActionHandler("seekbackward", () => {
    audio.currentTime -= 15;
    updatePositionState();
  });
  navigator.mediaSession.setActionHandler("seekto", e => {
    audio.currentTime = e.seekTime || 0;
    updatePositionState();
  });
  navigator.mediaSession.setActionHandler("nexttrack", () => {
    onEnd();
    updatePositionState();
  });
}


