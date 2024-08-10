import { instanceSelector, listBtnsContainer, listContainer, listSection, loadingScreen, openInYtBtn, playAllBtn, subscribeListBtn } from "../lib/dom";
import { getDB } from "../lib/libraryUtils";
import { getApi, getPlaylistIdFromArtist, goTo, itemsLoader, notify, superClick } from "../lib/utils";
import { store } from "../store";

export default async function fetchList(url: string | undefined, mix = false) {
  if (!url)
    return notify('No Channel URL provided');

  loadingScreen.showModal();

  if (
    location.search.endsWith('music_artists') ||
    store.actionsMenu.author.endsWith(' - Topic')
  )
    url = await getPlaylistIdFromArtist(url);

  const api = getApi('piped');

  const group = await fetch(api + url)
    .then(res => res.json())
    .catch(err => {
      if (err.message !== 'No Data Found' && instanceSelector.selectedIndex < instanceSelector.length - 1) {
        instanceSelector.selectedIndex++;
        fetchList(url, mix);
        return;
      }
      notify(mix ? 'No Mixes Found' : err.message);
      instanceSelector.selectedIndex = 0;
    })
    .finally(() => loadingScreen.close());

  if (!group.relatedStreams.length)
    return notify('No Data Found');


  if (listContainer.classList.contains('reverse'))
    listContainer.classList.remove('reverse');
  listContainer.innerHTML = '';
  listContainer.appendChild(
    itemsLoader(
      group.relatedStreams
    )
  );

  goTo('/list');
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
      }))
      .observe(listContainer.children[listContainer.childElementCount - 3]);
  }
  if (!mix && token)
    setObserver(async () => {
      const data = await fetch(
        api + '/nextpage/' +
        url.substring(1) + '?nextpage=' + encodeURIComponent(token)
      )
        .then(res => res.json())
        .catch(e => console.log(e));
      if (!data) return;
      const existingItems: string[] = [];
      listContainer.querySelectorAll('.streamItem').forEach((v) => {
        existingItems.push((v as HTMLElement).dataset.id as string);
      });
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

  const type = url.includes('channel') ? 'channel' : 'playlist';

  listBtnsContainer.className = type;

  openInYtBtn.innerHTML = '<i class="ri-external-link-line"></i> ' + group.name;

  store.list.name = group.name;
  store.list.url = url;
  store.list.type = type + 's';
  store.list.id = url.slice(type === 'playlist' ? 11 : 9);
  store.list.uploader = group.uploader || group.name;
  store.list.thumbnail = store.list.thumbnail?.startsWith(url) ? store.list.thumbnail.slice(url.length) :
    group.avatarUrl || group.thumbnail || group.relatedStreams[0].thumbnail;

  const db = Object(getDB());

  subscribeListBtn.innerHTML = `<i class="ri-stack-line"></i> Subscribe${db.hasOwnProperty(store.list.type) && db[store.list.type].hasOwnProperty(store.list.id) ? 'd' : ''
    }`;

  if (mix) playAllBtn.click();
  else {
    // replace string for youtube playlist link support
    store.list.url = url.replace('ts/', 't?list=');
    document.title = group.name + ' - ytify';

    history.replaceState({}, '',
      location.origin + location.pathname +
      '?' + url
        .split('/')
        .join('=')
        .substring(1)
    );

  }

}

listContainer.addEventListener('click', superClick);
