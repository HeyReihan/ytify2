import { Show, createSignal } from 'solid-js';
import './StreamItem.css';
import { generateImageUrl } from '../lib/imageUtils';
import { getSaved } from '../lib/utils';

export default function StreamItem(data: {
  id: string,
  title: string,
  author: string,
  duration: string,
  href?: string,
  uploaded?: string,
  channelUrl?: string,
  views?: string,
}) {

  const [getImage, setImage] = createSignal('');
  const showImage = (getSaved('img') !== 'off');

  let parent!: HTMLAnchorElement;


  function handleThumbnailLoad(e: Event) {
    const img = e.target as HTMLImageElement;
    const src = getImage();

    if (img.naturalWidth !== 120) {
      parent.classList.remove('ravel');
      return;
    }
    if (src.includes('webp'))
      setImage(src.replace('.webp', '.jpg').replace('vi_webp', 'vi'));
    else { // most likely been removed from yt so remove it 
      parent.classList.add('delete');
      parent.click();
    }
  }

  function handleThumbnailError() {

    const src = getImage();

    setImage(
      src.includes('vi_webp') ?
        src.replace('.webp', '.jpg').replace('vi_webp', 'vi') :
        '/ytify_lite.svg'
    );

    parent.classList.remove('ravel');
  }



  if (showImage)
    setImage(generateImageUrl(data.id, 'mq'));

  return (
    <a
      class={'streamItem ' + (showImage ? 'ravel' : '')}
      href={data.href}
      ref={parent}
      data-id={data.id}
      data-title={data.title}
      data-author={data.author}
      data-channel_url={data.channelUrl}
      data-duration={data.duration}
      data-thumbnail={getImage()}
    >
      <span>
        <Show when={showImage} fallback={data.duration}>
          <img
            crossorigin='anonymous'
            onerror={handleThumbnailError}
            onload={handleThumbnailLoad}
            src={getImage()}
          />
          <p class='duration'>{data.duration}</p>
        </Show>
      </span>
      <div class='metadata'>
        <p class='title'>{data.title}</p>
        <div class='avu'>
          <p class='author'>{data.author.replace(' - Topic', '')}</p>
          <p class='viewsXuploaded'>{data.views || '' + (data.uploaded ? ' • ' + data.uploaded.replace('Streamed ', '') : '')}</p>
        </div>
      </div>
    </a>
  )
}
