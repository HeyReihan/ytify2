import { getSaved, save } from "./utils";
import { render } from "solid-js/web";
import StreamItem from "../components/StreamItem";


export const getDB = (): Library => JSON.parse(getSaved('library') || '{"discover":{}}');

export const saveDB = (data: Library) => save('library', JSON.stringify(data));

const container = document.getElementById('favoritesContainer') as HTMLDivElement;

export function createCollectionItem(data: CollectionItem | DOMStringMap) {

  const fragment = document.createDocumentFragment();

  render(() => StreamItem({
    id: data.id || '',
    title: data.title || '',
    author: data.author || '',
    duration: data.duration || '',
    channelUrl: data.channelUrl || ''
  }), fragment);

  return fragment;

}

export function removeFromCollection(collection: string, id: string) {
  const db = getDB();
  delete db[collection][id];
  container.querySelector(`[data-id="${id}"]`)?.remove();
  saveDB(db);
}

export function toCollection(collection: string, data: CollectionItem | DOMStringMap, db: Library) {
  const id = <string>data.id;
  if (db.hasOwnProperty(collection)) {
    if (db[collection].hasOwnProperty(id)) { // delete old data if already exists
      delete db[collection][id];
      container.querySelector(`[data-id="${id}"]`)?.remove();
    }
  } // create if collection does not exists
  else db[collection] = {};
  db[collection][id] = data;
}

export function addToCollection(collection: string, data: CollectionItem | DOMStringMap) {
  const db = getDB();
  toCollection(collection, data, db);
  container.prepend(createCollectionItem(data))
  saveDB(db);
}

