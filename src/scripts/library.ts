import { audio, favButton, favIcon } from "../lib/dom";
import { addToCollection, createCollectionItem, getDB, removeFromCollection, saveDB, toCollection } from "../lib/libraryUtils";
import { $, removeSaved, superClick } from "../lib/utils";
import { listToQ } from "./queue";


const importBtn = document.getElementById('upload') as HTMLInputElement;
const exportBtn = document.getElementById('exportBtn') as HTMLButtonElement;
const cleanBtn = document.getElementById('cleanLibraryBtn') as HTMLButtonElement;


importBtn.addEventListener('change', async () => {
  const newDB = JSON.parse(await (<FileList>importBtn.files)[0].text());
  const oldDB = getDB();
  if (!confirm('This will merge your current library with the imported library, continue?')) return;
  for (const collection in newDB) for (const item in newDB[collection])
    toCollection(collection, newDB[collection][item], oldDB)
  saveDB(oldDB);
  location.reload();
});


exportBtn.addEventListener('click', () => {
  const link = $('a');
  link.download = 'ytify_library.json';
  link.href = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(getDB(), undefined, 2))}`;
  link.click();
});

cleanBtn.addEventListener('click', () => {

  const library = document.getElementById('library') as HTMLDivElement;
  const libraryItems = library.getElementsByTagName('stream-item');

  if (!confirm('Are you sure you want to clear ' + libraryItems.length + ' items from the library?')) return;
  removeSaved('library');
  location.reload();
});


// setup initial dom state

const initialData = getDB();

const [clearBtn, removeBtn, enqueueBtn, container] = (document.getElementById('favorites') as HTMLDivElement).children as HTMLCollectionOf<HTMLDivElement>;

container.addEventListener('click', superClick);


clearBtn.addEventListener('click', () => {
  const db = getDB();
  delete db['favorites'];
  saveDB(db);
  container.innerHTML = '';
});

removeBtn.addEventListener('click', () => {
  container.querySelectorAll('.streamItem').forEach(e => e.classList.toggle('delete'));
  removeBtn.classList.toggle('delete');
})

enqueueBtn.onclick = () => listToQ(container);

const fragment = document.createDocumentFragment();

for (const data in initialData.favorites)
  fragment.prepend(createCollectionItem(initialData.favorites[data]))
container.appendChild(fragment);



// favorites button & data

favButton.addEventListener('click', () => {
  const id = audio.dataset.id;
  if (!id) return;
  favButton.checked ?
    addToCollection('favorites', audio.dataset) :
    removeFromCollection('favorites', id);

  favIcon.classList.toggle('ri-heart-fill');
});

