import css from './streamItem.css?inline';
import { blankImage, getSaved } from '../lib/utils';


customElements.define('stream-item', class extends HTMLElement {
	constructor() {
		super();
		this.attachShadow({ mode: 'open' });

		const style = document.createElement('style');
		style.textContent = css;

		const span = document.createElement('span');

		const thumbnail = document.createElement('img');
		thumbnail.crossOrigin = 'anonymous';
		thumbnail.src = blankImage;
		thumbnail.id = 'thumbnail';
		thumbnail.loading = 'lazy';
		thumbnail.onerror = () => {
			thumbnail.src = blankImage;
		}

		const duration = document.createElement('p');
		duration.id = 'duration';

		span.append(thumbnail, duration);
		const metadata = document.createElement('div');
		metadata.id = 'metadata';

		const aau = document.createElement('div');
		aau.id = 'aau';

		const slot = document.createElement('slot');

		const avu = document.createElement('div');
		avu.id = 'avu';

		const avatar = document.createElement('img');
		avatar.id = 'avatar';
		avatar.loading = 'lazy';

		const author = document.createElement('p');
		author.id = 'author';

		const viewsXuploaded = document.createElement('p');
		viewsXuploaded.id = 'viewsXuploaded';

		avu.append(author, viewsXuploaded);
		aau.append(avatar, avu);
		metadata.append(slot, aau);
		this.shadowRoot?.append(style, span, metadata);

	}
	connectedCallback() {

		const root = this.shadowRoot;
		const data = this.dataset;

		if (!root || !data) return;

		const thumbnail = <HTMLImageElement>root.getElementById('thumbnail');
		const avatar = <HTMLImageElement>root.getElementById('avatar');
		const duration = <HTMLParagraphElement>root.getElementById('duration');
		const author = <HTMLParagraphElement>root.getElementById('author');
		const viewsXuploaded = <HTMLParagraphElement>root.getElementById('viewsXuploaded');


		if (!getSaved('img')) {
			if (data.thumbnail)
				thumbnail.src = data.thumbnail;

			data.avatar ?
				avatar.src = data.avatar :
				avatar.style.display = 'none';

		}

		if (data.duration)
			duration.textContent = data.duration

		if (data.author)
			author.textContent = data.author;

		if (data.views)
			viewsXuploaded.textContent = data.views + (data.uploaded ? ' • ' + data.uploaded : '');
	}
})
