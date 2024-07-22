import { getSaved } from '../lib/utils';
import './ListItem.css';
import { Show, createSignal } from 'solid-js';


export default function ListItem(
  title: string,
  stats: string,
  thumbnail: string,
  uploader_data: string,
  url: string,
) {
  const [getThumbnail, setThumbnail] = createSignal(thumbnail);
  const showImage = getSaved('img') !== 'off';

  function handleError(e: Event) {
    const img = e.target as HTMLImageElement;
    img.parentElement!.classList.remove('ravel');
    setThumbnail('/ytify_lite.svg');
  }




  function handleLoad(e: Event) {
    const img = e.target as HTMLImageElement;
    img.parentElement!.classList.remove('ravel');
  }


  return (
    <a
      class={'listItem ' + (showImage ? 'ravel' : '')}
      href={'https://youtube.com' + url}
      data-url={url}
      data-thumbnail={thumbnail}
    >
      <Show when={showImage}>
        <img
          src={getThumbnail()}
          onError={handleError}
          onLoad={handleLoad}
        />
      </Show>
      <div>
        <p class="title">{title}</p>
        <p class="uData">{uploader_data}</p>
        <p class="stats">{stats}</p>
      </div>
    </a>
  );
}
