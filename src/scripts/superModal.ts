import { playNow, queueNext, queuelist, startRadio, superModal } from "../lib/dom";
import player from "../lib/player";
import { orderByFrequency, relativesData, sanitizeAuthorName, similarStreamsCollector } from "../lib/utils";

export const streamHistory: string[] = [];

let oneOff = true;
superModal.addEventListener('click', () => {
  if (oneOff) {
    (<HTMLHeadingElement>queuelist.firstElementChild).remove();
    oneOff = !oneOff;
  }
  superModal.classList.toggle('hide');
});


playNow.addEventListener('click', () => {
  player(superModal.dataset.id);
});

export const queueArray: string[] = [];



queueNext.addEventListener('click', () => {
  appendToQueuelist(superModal.dataset);
})


export const appendToQueuelist = (data: DOMStringMap, prepend: boolean = false) => {
  queueArray.push(data.id || '');

  const listItem = document.createElement('stream-item');
  listItem.textContent = data.title || '';
  listItem.dataset.author = data.author;
  listItem.dataset.thumbnail = data.thumbnail;
  listItem.dataset.duration = data.duration;
  listItem.dataset.id = data.id;

  listItem.addEventListener('click', () => {
    const id = listItem.dataset.id || '';
    player(id);
    const index = queueArray.indexOf(id);
    queueArray.splice(index, 1);
    queuelist.children[index].remove();
  });
  prepend ?
    queuelist.prepend(listItem) :
    queuelist.appendChild(listItem);
}

function radio(relatives: string[]) {
  const orderedItems = orderByFrequency(relatives);

  if (!orderedItems) return;
  orderedItems.filter(stream => !streamHistory.includes(stream) && !queueArray.includes(stream));
  if (orderedItems.length) {
    for (const id of orderedItems) {
      queueArray.push(id);
      appendToQueuelist(relativesData[id]);
    }
  }
}

startRadio.addEventListener('click', async () => {
  radio(
    await similarStreamsCollector(
      superModal.dataset.title +
      sanitizeAuthorName(superModal.dataset.author),
      superModal.dataset.id || ''
    )
  );
})