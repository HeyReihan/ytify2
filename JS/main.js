import { ytID, themer, imageURL, getSaved, save, input, metadata, codecs, query } from './constants.js'


let quality = codecs.low;
let codecCount = 0;

const audio = document.querySelector('audio');

const play = (url) => {
  fetch(metadata + url)
    .then(res => res.json())
    .then(data => {
      // check if link is valid
      if (data.title !== undefined) {
        // Playback
        audio.src = `https://projectlounge.pw/ytdl/download?url=${data.url}&format=${quality[codecCount]}`;
        themer(imageURL(url), getSaved('theme'));
        audio.onerror = () => {
          codecCount++;
          play(url);
        }
        save('title', data.title);
        document.querySelector('#title').innerText = data.title;
        document.querySelector('#author').innerText = data.author_name;
        history.pushState('', '', location.origin + '/?q=' + ytID(url));
        history.replaceState('', '', location.origin + '/?q=' + ytID(url));

      }
    });
}

input.addEventListener('input', () => {
  play(input.value);
  playButton.innerText = 'play_arrow';
});

const playButton = document.querySelector('#playButton');
let playback = true;

playButton.addEventListener('click', () => {
  if (playback) {
    audio.play();
    playButton.innerText = 'pause';
  } else {
    audio.pause();
    playButton.innerText = 'play_arrow';
  }
});
audio.onended=()=>{
  playButton.innerText = 'stop';
}
if (query != null)
  play('https://youtu.be/' + query);