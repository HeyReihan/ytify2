import { audio, favButton, favIcon, playButton } from "./dom";
import { convertSStoHHMMSS, notify, params, setMetaData, getSaved, instance } from "./utils";
import { getDB } from "./libraryUtils";


const bitrateSelector = <HTMLSelectElement>document.getElementById('bitrateSelector');

/////////////////////////////////////////////////////////////


bitrateSelector.addEventListener('change', () => {
  const timeOfSwitch = audio.currentTime;
  audio.src = bitrateSelector.value;
  audio.currentTime = timeOfSwitch;
  audio.play();
});

function resolveSrc(audioStreams: Record<'codec' | 'url' | 'quality' | 'bitrate', string>[], isMusic: boolean = true): string {
  const noOfBitrates = audioStreams.length;

  if (!noOfBitrates) {
    notify('NO AUDIO STREAMS AVAILABLE.');
    playButton.classList.replace(playButton.className, 'ri-stop-circle-fill');
    return '';
  }
  const preferedCodec = 'opus';
  let index = -1;

  bitrateSelector.innerHTML = '';

  audioStreams.forEach((_, i: number) => {
    const codec = _.codec === 'opus' ? 'opus' : 'aac';

    const oldUrl = new URL(_.url);

    // Conditional Proxying
    const newUrl = (isMusic) ? _.url.replace('pipedproxy', 'invidious') : _.url.replace(oldUrl.origin, oldUrl.host);

    // add to DOM
    bitrateSelector.add(new Option(`${_.quality} ${codec}`, newUrl));


    // find preferred bitrate
    const codecPref = preferedCodec ? codec === preferedCodec : true;
    const hqPref = getSaved('hq') ? noOfBitrates : 0;
    if (codecPref && index < hqPref) index = i;
  });

  bitrateSelector.selectedIndex = index;
  return bitrateSelector.value;
}
/////////////////////////////////////////////////////////////

export default async function player(id: string | null = '') {

  if (!id) return;

  playButton.classList.replace(playButton.className, 'ri-loader-3-line');

  const data = await fetch(instance + '/streams/' + id)
    .then(res => res.json())
    .then(res => {
      if ('error' in res)
        throw new Error(res.error)
      else return res;
    })
    .catch(err => {
      notify(err.message);
      playButton.classList.replace(playButton.className, 'ri-stop-circle-fill');
    });



  if (audio.canPlayType('audio/ogg')) {
    bitrateSelector.className = ''
    audio.src = resolveSrc(
      data.audioStreams
        .sort((a: { bitrate: number }, b: { bitrate: number }) => (a.bitrate - b.bitrate))
      , data.category === 'Music');
  }
  else {
    bitrateSelector.className = 'hide';
    audio.src = data.hls;
  }

  // remove ' - Topic' from name if it exists

  let music = false;
  if (data.uploader.endsWith(' - Topic')) {
    music = true;
    data.uploader = data.uploader.replace(' - Topic', '');
  }

  setMetaData(
    id,
    data.title,
    data.uploader,
    data.uploaderUrl,
    music
  );


  params.set('s', id);

  if (location.pathname === '/')
    history.replaceState({}, '', location.origin + '?s=' + params.get('s'));

  audio.dataset.id = id;
  audio.dataset.title = data.title;
  audio.dataset.author = data.uploader;
  audio.dataset.duration = convertSStoHHMMSS(data.duration);
  audio.dataset.channelUrl = data.uploaderUrl;


  // favbutton state
  // reset
  if (favButton.checked) {
    favButton.checked = false;
    favIcon.classList.remove('ri-heart-fill');
  }

  // set
  if (getDB().favorites?.hasOwnProperty(id)) {
    favButton.checked = true;
    favIcon.classList.add('ri-heart-fill');
  }

}
