import './Settings.css';
import { onMount, JSXElement } from "solid-js";
import { audio, img, searchFilters } from "../lib/dom";
import { getSaved, removeSaved, save } from "../lib/utils";
import { cssVar, themer } from '../scripts/theme';
import player from '../lib/player';
import { blankImage } from '../lib/imageUtils';



function ToggleSwitch(props: {
  name: string
  id: string,
  checked: () => boolean,
  onClick: (e: Event) => void
}) {
  return (
    <div class='toggleSwitch'>
      <label for={props.id}>
        {props.name}
      </label>
      <input
        type='checkbox'
        id={props.id}
        checked={props.checked()}
        onClick={props.onClick}
      />
    </div>
  );
}

function Selector(props: {
  label: string,
  id: string,
  onChange: (e: { target: HTMLSelectElement }) => void,
  onMount: (target: HTMLSelectElement) => void,
  children: JSXElement
}) {
  let target!: HTMLSelectElement;
  onMount(() => props.onMount(target));

  return (
    <span class='selector'>
      <label for={props.id}>
        {props.label}
      </label>
      <select
        id={props.id}
        onChange={props.onChange}
        ref={target}
      >{props.children}</select>
    </span>
  );
}


export default function Settings() {

  return (
    <>
      <i>
        <a href='https://adminforge.de' target='_blank'>Powered By adminforge.de</a>

        <a href='https://github.com/n-ce/ytify/tree/lite' target='_blank'>Github</a>

        <a href='https://t.me/ytifytg' target='_blank'>Telegram</a>

        <a href='https://matrix.to/#/#ytify:matrix.org' target='_blank'>Matrix</a>
      </i>

      <ToggleSwitch
        id='thumbnailSwitch'
        name='Load Thumbnails'
        checked={() => {
          if (!getSaved('img')) return true;
          img.src = blankImage;
          img.classList.toggle('hide');
          return false;
        }}
        onClick={() => {

          getSaved('img') ?
            removeSaved('img') :
            save('img', 'off');
          location.reload();
        }}
      />

      <ToggleSwitch
        id="defaultFilterSongs"
        name='Songs as Default Filter'
        checked={() => {
          if (getSaved('searchFilter') !== 'music_songs') return false;
          searchFilters.value = 'music_songs';
          return true;
        }}
        onClick={() => {
          getSaved('searchFilter') ?
            removeSaved('searchFilter') :
            save('searchFilter', 'music_songs');
          location.assign('/search');
        }}
      />

      <ToggleSwitch
        id='featuredPlaylistsSwitch'
        name='Featured Playlists'
        checked={() => {
          if (!getSaved('featuredPlaylists')) return true;

          document.querySelector('h1.featuredPlaylists')!.textContent = 'Search Results Appear Here.';
          return false;
        }}
        onClick={() => {
          getSaved('featuredPlaylists') ?
            removeSaved('featuredPlaylists') :
            save('featuredPlaylists', 'off');
          location.assign('/search');
        }}
      />

      <ToggleSwitch
        id="suggestionsSwitch"
        name='Display Search Suggestions'
        checked={() => getSaved('searchSuggestions') !== 'off'}
        onClick={() => {
          getSaved('searchSuggestions') ?
            removeSaved('searchSuggestions') :
            save('searchSuggestions', 'off');
          location.reload();
        }}
      />

      <ToggleSwitch
        id="qualitySwitch"
        name='Highest Quality Audio'
        checked={() => getSaved('hq') === 'true'}
        onClick={async () => {
          getSaved('hq') ?
            removeSaved('hq') :
            save('hq', 'true');
          const timeOfSwitch = audio.currentTime;
          await player(audio.dataset.id);
          audio.currentTime = timeOfSwitch;
        }}
      />

      <Selector
        id='startupTab'
        label='Default Tab on Startup'
        onChange={(e) => {
          const tab = e.target.value;
          tab ?
            save('startupTab', tab) :
            removeSaved('startupTab');
        }}
        onMount={(target) => {

          const savedStartupTab = getSaved('startupTab') || '';
          if (savedStartupTab) {
            target.value = savedStartupTab;
            if (location.pathname === '/')
              document.getElementById(savedStartupTab)!.click();
          }

        }}
      >
        <option value="">Home</option>
        <option value="/search">Search</option>
        <option value="/library">Library</option>

      </Selector>

      <Selector
        label='Roundness'
        id='roundnessChanger'
        onChange={(e) => {
          cssVar('--roundness', e.target.value);
          e.target.value === '2vmin' ?
            removeSaved('roundness') :
            save('roundness', e.target.value)
        }}
        onMount={(target) => {
          if (getSaved('roundness')) {
            target.value = getSaved('roundness') || '2vmin';
            cssVar('--roundness', target.value);
          }
        }}
      >
        <option value="none">None</option>
        <option value="1vmin">Light</option>
        <option value="2vmin" selected>Medium</option>
        <option value="4vmin">Heavy</option>
      </Selector>

      <Selector
        label='Theming Scheme'
        id='themeSelector'
        onChange={(e) => {
          themer();
          e.target.value === 'auto' ?
            removeSaved('theme') :
            save('theme', e.target.value);
        }}
        onMount={(target) => {
          target.value = (getSaved('theme') as 'light' | 'dark') || 'auto';
        }}
      >

        <optgroup label="Dynamic">
          <option value="auto" selected>System</option>
          <option value="light">Light</option>
          <option value="dark">Dark</option>
        </optgroup>
        <optgroup label="High Contrast">
          <option value="auto-hc">System</option>
          <option value="white">White</option>
          <option value="black">Black</option>
        </optgroup>
      </Selector>

      <ToggleSwitch
        id='reverseNavSwitch'
        name='Reverse Navigation'
        checked={() => {
          if (!getSaved('reverseNav')) return false;

          document.body.classList.toggle('reverseNav');
          document.querySelector('nav')!.classList.toggle('reverseNav');
          return true;
        }
        }
        onClick={() => {
          getSaved('reverseNav') ?
            removeSaved('reverseNav') :
            save('reverseNav', 'true');

          document.body.classList.toggle('reverseNav');
          document.querySelector('nav')!.classList.toggle('reverseNav');
        }}
      />

      <ToggleSwitch
        id='fullscreenBtn'
        name='Toggle Fullscreen'
        checked={() => false}
        onClick={
          () => {
            document.fullscreenElement ?
              document.exitFullscreen() :
              document.documentElement.requestFullscreen();
          }
        } />

      <button
        id='restoreSettingsBtn'
        onclick={() => {
          const temp = getSaved('library');
          localStorage.clear();

          if (temp)
            save('library', temp);

          location.reload();
        }}
      >Restore Settings</button>

    </>
  );
}



