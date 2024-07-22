import { audio, img, listAnchor, listContainer, listSection, loadingScreen, openInYtBtn, playAllBtn, superModal } from "./dom";
import { removeFromCollection } from "./libraryUtils";
import { blankImage, generateImageUrl, sqrThumb } from "./imageUtils";
import StreamItem from "../components/StreamItem";
import ListItem from "../components/ListItem";
import { render } from "solid-js/web";

export const instance = 'https://pipedapi.adminforge.de';

export const params = (new URL(location.href)).searchParams;

export const $ = document.createElement.bind(document);

export const save = localStorage.setItem.bind(localStorage);

export const getSaved = localStorage.getItem.bind(localStorage);

export const removeSaved = localStorage.removeItem.bind(localStorage);

export const idFromURL = (link: string | null) => link?.match(/(https?:\/\/)?((www\.)?(youtube(-nocookie)?|youtube.googleapis)\.com.*(v\/|v=|vi=|vi\/|e\/|embed\/|user\/.*\/u\/\d+\/)|youtu\.be\/)([_0-9a-z-]+)/i)?.[7];

export const numFormatter = (num: number): string => Intl.NumberFormat('en', { notation: 'compact' }).format(num);

export function notify(text: string) {
  const el = $('p');
  const clear = () => document.getElementsByClassName('snackbar')[0] && el.remove();
  el.className = 'snackbar';
  el.textContent = text;
  el.onclick = clear;
  setTimeout(clear, 8e3);
  document.body.appendChild(el);
}


export function convertSStoHHMMSS(seconds: number): string {
  if (seconds < 0) return '';
  const hh = Math.floor(seconds / 3600);
  seconds %= 3600;
  const mm = Math.floor(seconds / 60);
  const ss = Math.floor(seconds % 60);
  let mmStr = String(mm);
  let ssStr = String(ss);
  if (mm < 10) mmStr = '0' + mmStr;
  if (ss < 10) ssStr = '0' + ssStr;
  return (hh > 0 ?
    hh + ':' : '') + `${mmStr}:${ssStr}`;
}


export function setMetaData(
  id: string,
  streamName: string,
  authorName: string,
  authorUrl: string,
  music: boolean = false
) {
  const imgX = generateImageUrl(id, 'maxres');
  if (!getSaved('img') && !music)
    img.src = imgX;

  img.alt = streamName;

  const title = <HTMLAnchorElement>document.getElementById('title');
  title.href = `https://youtube.com/watch?v=${id}`;
  title.textContent = streamName;
  title.onclick = _ => {
    _.preventDefault();
    superModal.showModal();
    history.pushState({}, '', '#');
    const s = superModal.dataset;
    const a = audio.dataset;
    s.id = a.id;
    s.title = a.title;
    s.author = a.author;
    s.duration = a.duration;
    s.channelUrl = a.channelUrl;
  }

  const author = <HTMLAnchorElement>document.getElementById('author');
  author.href = 'https://youtube.com' + authorUrl;
  author.onclick = _ => {
    _.preventDefault();
    fetchList(authorUrl);
  }
  author.textContent = authorName;

  if (location.pathname === '/')
    document.title = streamName + ' - ytify';

  const canvasImg = new Image();
  canvasImg.onload = () => {
    const sqrImg = getSaved('img') ? blankImage : sqrThumb(canvasImg);
    if (music)
      img.src = sqrImg;

    if ('mediaSession' in navigator) {
      navigator.mediaSession.setPositionState();
      navigator.mediaSession.metadata = new MediaMetadata({
        title: streamName,
        artist: authorName,
        artwork: [
          { src: sqrImg, sizes: '96x96' },
          { src: sqrImg, sizes: '128x128' },
          { src: sqrImg, sizes: '192x192' },
          { src: sqrImg, sizes: '256x256' },
          { src: sqrImg, sizes: '384x384' },
          { src: sqrImg, sizes: '512x512' },
        ]
      });
    }

  }
  canvasImg.crossOrigin = '';
  canvasImg.src = imgX;
}



export function fetchList(url: string, mix = false) {

  loadingScreen.showModal();

  fetch(instance + url)
    .then(res => res.json())
    .then(group => {
      listContainer.innerHTML = '';
      listContainer.appendChild(
        itemsLoader(
          group.relatedStreams
        )
      );
      listAnchor.click();
      listSection.scrollTo(0, 0);

      let token = group.nextpage;
      function setObserver(callback: () => Promise<string>) {
        new IntersectionObserver((entries, observer) =>
          entries.forEach(async e => {
            if (e.isIntersecting) {
              token = await callback();
              observer.disconnect();
              if (token)
                setObserver(callback);
            }
          })).observe(listContainer.children[listContainer.childElementCount - 3]);
      }
      if (!mix && token)
        setObserver(async () => {
          const data = await fetch(
            instance + '/nextpage/' +
            url.substring(1) + '?nextpage=' + encodeURIComponent(token)
          )
            .then(res => res.json())
            .catch(e => console.log(e));
          if (!data) return;
          const existingItems: string[] = [];
          for (const item of listContainer.children)
            existingItems.push((<HTMLAnchorElement>item).href.slice(-11))

          listContainer.appendChild(
            itemsLoader(
              data.relatedStreams.filter(
                (item: StreamItem) => !existingItems.includes(
                  item.url.slice(-11))
              )
            )
          );
          return data.nextpage;
        });

      openInYtBtn.innerHTML = '<i class="ri-external-link-line"></i> ' + group.name;

      if (mix) playAllBtn.click();
      else {
        history.replaceState({}, '',
          location.origin + location.pathname +
          '?' + url
            .split('/')
            .join('=')
            .substring(1)
        );
        // replace string for youtube playlist link support
        listContainer.dataset.url = url.replace('ts/', 't?list=');

        document.title = group.name + ' - ytify';
      }
    })
    .catch(err => {
      notify(mix ? 'No Mixes Found' : err.message);
    })
    .finally(() => loadingScreen.close());
}

listContainer.addEventListener('click', superClick);

if (params.has('channel') || params.has('playlists'))
  fetchList('/' +
    location.search
      .substring(1)
      .split('=')
      .join('/')
  );

export function itemsLoader(itemsArray: StreamItem[]) {
  if (!itemsArray.length)
    throw new Error('No Data Found');
  function getThumbIdFromLink(url: string) {
    // for featured playlists
    if (url.startsWith('/')) return url;

    const l = new URL(url);
    const p = l.pathname;

    return l.search.includes('ytimg') ?
      p.split('/')[2] :
      p.split('=')[0];
  }

  const streamItem = (stream: StreamItem) => StreamItem({
    id: stream.url.substring(9),
    href: stream.url,
    title: stream.title,
    author: stream.uploaderName,
    duration: stream.duration > 0 ? convertSStoHHMMSS(stream.duration) : 'LIVE',
    uploaded: stream.uploadedDate,
    channelUrl: stream.uploaderUrl,
    views: (stream.views > 0 ? numFormatter(stream.views) + ' views' : '')
  })

  const listItem = (item: StreamItem) => ListItem(
    item.name,
    item.subscribers > 0 ?
      (numFormatter(item.subscribers) + ' subscribers') :
      (item.videos > 0 ? item.videos + ' streams' : ''),
    generateImageUrl(
      getThumbIdFromLink(
        item.thumbnail
      )
    ),
    item.description || item.uploaderName,
    item.url
  )

  const fragment = document.createDocumentFragment();
  for (const item of itemsArray)
    render(() => (item.type === 'stream' || item.type === 'video') ? streamItem(item) : listItem(item), fragment);


  return fragment;
}

/*
// TLDR : Stream Item Click Action
export function superClick(e: Event) {
  const elem = e.target as HTMLAnchorElement;
  if (elem.target === '_blank') return;
  e.preventDefault();

  const eld = elem.dataset;
  const elc = elem.classList.contains.bind(elem.classList);

  if (elc('streamItem'))
    return elc('delete') ?
      removeFromCollection(listAnchor.dataset.id as string, eld.id as string)
      : player(eld.id);

  else if (elc('ri-more-2-fill')) {
    superModal.showModal();
    history.pushState({}, '', '#');
    const elp = elem.parentElement?.dataset;
    for (const x in elp)
      superModal.dataset[x] = elp[x];
  }

  else if (elc('ur_pls_item'))
    fetchCollection(elem.textContent as string);

  else if (elc('listItem')) {
    let url = eld.url as string;
    if (!url.startsWith('/channel'))
      url = url.replace('?list=', 's/')
    fetchList(url);
    store.list.thumbnail = url + eld.thumbnail;
  }
}*/

// TLDR : Stream Item Click Action
export function superClick(e: Event) {
  e.preventDefault();
  const elem = e.target as HTMLElement;
  const eld = elem.dataset;

  if (elem.classList.contains('streamItem')) {
    if (elem.classList.contains('delete')) {
      removeFromCollection('favorites', eld.id as string)
      return;
    }
    superModal.showModal();
    history.pushState({}, '', '#');
    const smd = superModal.dataset;
    smd.id = eld.id
    smd.title = eld.title;
    smd.author = eld.author;
    smd.channelUrl = eld.channel_url;
    smd.duration = eld.duration;
  }

  if (elem.classList.contains('listItem')) {
    let url = eld.url as string;
    if (!url.startsWith('/channel'))
      url = url.replace('?list=', 's/')
    fetchList(url);
  }
}


