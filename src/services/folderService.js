import { openDB } from 'idb';

const dbPromise = openDB('memoApp', 1, {
  upgrade(db) {
    if (!db.objectStoreNames.contains('folders')) {
      const folderStore = db.createObjectStore('folders', { keyPath: 'id', autoIncrement: true });
      folderStore.createIndex('name', 'name', { unique: false });
    }
  },
});

export const getFolders = async () => {
  const db = await dbPromise;
  return db.getAll('folders');
};

export const getFolder = async (id) => {
  const db = await dbPromise;
  return db.get('folders', id);
};

export const createFolder = async (folder) => {
  const db = await dbPromise;
  return db.add('folders', {
    ...folder,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
};

export const updateFolder = async (id, folderData) => {
  const db = await dbPromise;
  const folder = await getFolder(id);
  
  if (!folder) {
    throw new Error('フォルダが見つかりません');
  }
  
  const updatedFolder = {
    ...folder,
    ...folderData,
    updatedAt: new Date().toISOString(),
  };
  
  return db.put('folders', updatedFolder);
};

export const deleteFolder = async (id) => {
  const db = await dbPromise;
  return db.delete('folders', id);
};
