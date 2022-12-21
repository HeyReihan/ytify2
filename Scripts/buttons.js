import {
  settingsButton,
  queueButton,
  loopButton,
  themer,
  getSaved,
  save,
  query,
  image,
  audio,
  progress
} from './constants.js';



// settings panel toggle

let settingsPanel = true;
let style;

settingsButton.addEventListener('click',
  () => {
    settingsPanel ?
      style = ['rotate(360deg) scale(0.9)', 'flex'] :
      style = ['rotate(0deg)', 'none'];
    settingsButton.style.transform = style[0];
    document.querySelector('#settingsContainer').style.display = style[1];
    settingsButton.classList.toggle('on');
    settingsPanel = !settingsPanel;
  });



// Theme toggle

const themeButton = document.querySelector('#themeButton');

themeButton.addEventListener('click', () => {
  if (getSaved('theme') == 'dark') {
    localStorage.removeItem('theme');
    themeButton.innerText = 'dark_mode';
  }
  else {
    save('theme', 'dark');
    themeButton.innerText = 'light_mode';
  }

  themer();
});



// fullscreen

let fullscreen = true;
const fullscreenButton = document.querySelector('#fullscreenButton');
fullscreenButton.addEventListener('click',
  () => {
    if (fullscreen) {
      document.documentElement.requestFullscreen();
      fullscreenButton.innerText = 'fullscreen_exit';
    }
    else {
      document.exitFullscreen();
      fullscreenButton.innerText = 'fullscreen';
    }
    fullscreenButton.classList.toggle('on');
    fullscreen = !fullscreen;
  });



// thumbnail toggle

const thumbnailButton = document.querySelector('#thumbnailButton');

let thumbnail = true;

thumbnailButton.addEventListener('click', () => {
  if (thumbnail) {
    save('thumbnail', image.src)
  } else {
    image.src = getSaved('thumbnail');
    localStorage.removeItem('thumbnail');
  }
  thumbnail = !thumbnail;
  thumbnailButton.classList.toggle('on');
  image.classList.toggle('hide');
});



// quality

const qualityButton = document.querySelector('#qualityButton');

let quality = true;

if (getSaved('quality') == 'hq') {
  qualityButton.classList.add('on');
  quality = false;
}

qualityButton.addEventListener('click', () => {
  quality ?
    save('quality', 'hq') : // high
    localStorage.removeItem('quality'); // low
  qualityButton.classList.toggle('on');
  quality = !quality;
});



// info

document.querySelector('#infoButton')
  .addEventListener('click',
    () => {
      if (
        confirm("The about page will be opened in a new tab. Continue?")
      ) {
        window.open("https://github.com/n-ce/ytify#about");
      }
    });



// delete all saved data

document.querySelector('#deleteDataButton')
  .addEventListener('click',
    () => {
      localStorage.clear();
      location.replace(location.origin);
    });



// play button and events

const playButton = document.querySelector('#playButton');

let playback = true;

playButton.addEventListener('click', () => {
  playback ?
    audio.play() :
    audio.pause();
  playback = !playback;
});

audio.addEventListener('playing', () => {
  playButton.classList.add('on');
  playButton.innerText = 'pause';
  playback = false;
});
audio.addEventListener('pause', () => {
  playButton.innerText = 'play_arrow';
});



// PLAYBACK SPEED

const playSpeed = document.querySelector('#playSpeed');

playSpeed.addEventListener('change', () => {
  if (playSpeed.value < 0 || playSpeed.value > 4) {
    return;
  }
  audio.playbackRate = playSpeed.value;
  playSpeed.blur();
});



// PROGRESS Bar event

progress.addEventListener('change', () => {
  if (progress.value < 0 || progress.value > audio.duration) {
    return;
  }
  audio.currentTime = progress.value;
  progress.blur();
});

audio.addEventListener('timeupdate', () => {
  if (progress === document.activeElement) {
    return;
  }
  progress.value = Math.floor(audio.currentTime);
});

audio.addEventListener('loadedmetadata', () => {
  progress.value = 0;
  progress.min = 0;
  progress.max = Math.floor(audio.duration);
});

// Loop


let loop = false;

audio.addEventListener('ended', () => {
  if (loop) {
    audio.play();
  }
  else {
    playButton.innerText = 'stop';
    playback = true;
  }
});

loopButton.addEventListener('click', () => {
  loopButton.classList.toggle('on');
  queueButton.classList.toggle('hide');
  loop = !loop;
});