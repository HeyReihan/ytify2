import { enqueueBtn, listContainer, openInYtBtn, playAllBtn } from '../lib/dom';
import { clearQ, firstItemInQueue, listToQ } from './queue';

playAllBtn.addEventListener('click', () => {
  clearQ();
  listToQ(listContainer);
  firstItemInQueue().click();
});

enqueueBtn.onclick = () => listToQ(listContainer);


openInYtBtn.onclick = () => open('https://youtube.com' + listContainer.dataset.url);
