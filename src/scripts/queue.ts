import { queuelist, upcomingBtn } from "../lib/dom";
import player from "../lib/player";
import { render } from "solid-js/web";
import StreamItem from "../components/StreamItem";

const queueArray: string[] = [];

const [
  clearQBtn,
  shuffleQBtn,
  removeQBtn
] = (<HTMLSpanElement>document.getElementById('queuetools')).children as HTMLCollectionOf<HTMLButtonElement>;

export const firstItemInQueue = () => <HTMLElement>queuelist.firstElementChild;

export function appendToQueuelist(data: DOMStringMap, prepend: boolean = false) {
  if (!data.id) return;

  if (queueArray.includes(data.id)) return;


  if (firstItemInQueue()?.matches('h1')) firstItemInQueue().remove();

  if (removeQBtn.classList.contains('delete')) removeQBtn.click();

  prepend ?
    queueArray.unshift(data.id) :
    queueArray.push(data.id);



  const fragment = document.createDocumentFragment();

  render(() => StreamItem({
    id: data.id || '',
    title: data.title || '',
    author: data.author || '',
    duration: data.duration || ''
  }), fragment);


  prepend ?
    queuelist.prepend(fragment) :
    queuelist.appendChild(fragment);

}


queuelist.addEventListener('click', e => {
  const queueItem = e.target as HTMLElement;
  if (!queueItem.matches('.streamItem')) return;
  const id = queueItem.dataset.id || '';
  if (!queueItem.classList.contains('delete')) player(id);

  const index = queueArray.indexOf(id);

  queueArray.splice(index, 1);
  queuelist.children[index].remove();
});


// clones any list items from the provided container to queue

export function listToQ(container: HTMLDivElement) {
  const items = container.querySelectorAll('.streamItem') as NodeListOf<HTMLElement>;
  items.forEach(item => {
    appendToQueuelist(item.dataset);
  });
  upcomingBtn.click();
}

export function clearQ() {
  queueArray.length = 0;
  queuelist.innerHTML = '';
}

clearQBtn.addEventListener('click', clearQ);

shuffleQBtn.addEventListener('click', () => {

  for (let i = queuelist.children.length; i >= 0; i--)
    queuelist.appendChild(queuelist.children[Math.random() * i | 0]);

  queueArray.length = 0;

  for (const item of queuelist.children)
    queueArray.push((<HTMLElement>item).dataset.id || '');

});

removeQBtn.addEventListener('click', () => {
  queuelist.querySelectorAll('.streamItem').forEach(el => {
    el.classList.toggle('delete')
  });
  removeQBtn.classList.toggle('delete');
});


