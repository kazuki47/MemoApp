const DB_NAME = 'memoAppDB';
const DB_VERSION = 1;
const FOLDER_STORE = 'folders';
const MEMO_STORE = 'memos';

// データベース初期化の単一のエントリーポイント
const openDB = () => {
  return new Promise((resolve, reject) => {
    console.log(`Opening database: ${DB_NAME}, version: ${DB_VERSION}`);
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      console.log(`Upgrading database to version ${DB_VERSION}`);
      const db = event.target.result;
      
      // フォルダストアの作成
      if (!db.objectStoreNames.contains(FOLDER_STORE)) {
        console.log(`Creating object store: ${FOLDER_STORE}`);
        const folderStore = db.createObjectStore(FOLDER_STORE, { keyPath: 'id', autoIncrement: true });
        folderStore.createIndex('name', 'name', { unique: false });
      }
      
      // メモストアの作成
      if (!db.objectStoreNames.contains(MEMO_STORE)) {
        console.log(`Creating object store: ${MEMO_STORE}`);
        const memoStore = db.createObjectStore(MEMO_STORE, { keyPath: 'id', autoIncrement: true });
        memoStore.createIndex('folderId', 'folderId', { unique: false });
        memoStore.createIndex('updatedAt', 'updatedAt', { unique: false });
      }
    };

    request.onsuccess = (event) => {
      console.log('Database opened successfully');
      resolve(event.target.result);
    };
    
    request.onerror = (event) => {
      console.error('Error opening database:', event.target.error);
      reject(event.target.error);
    };
  });
};

// 既存のデータベースをリセットする関数
const resetDatabase = () => {
  return new Promise((resolve, reject) => {
    console.log('Attempting to delete existing database...');
    const deleteRequest = indexedDB.deleteDatabase(DB_NAME);
    
    deleteRequest.onsuccess = () => {
      console.log('Database deleted successfully, now recreating...');
      openDB().then(resolve).catch(reject);
    };
    
    deleteRequest.onerror = (event) => {
      console.error('Error deleting database:', event.target.error);
      reject(event.target.error);
    };
  });
};

// データベースの存在確認と初期化をする関数
const initializeDatabase = async () => {
  try {
    const db = await openDB();
    const storeNames = Array.from(db.objectStoreNames);
    console.log('Current object stores:', storeNames);
    
    // 必要なストアが存在するか確認
    if (!storeNames.includes(FOLDER_STORE) || !storeNames.includes(MEMO_STORE)) {
      console.warn('Required object stores not found. Resetting database...');
      return resetDatabase();
    }
    
    return db;
  } catch (error) {
    console.error('Error during database initialization:', error);
    // エラーが発生した場合、データベースをリセットして再作成
    return resetDatabase();
  }
};

// アプリケーション起動時にデータベースを初期化
(async () => {
  try {
    await initializeDatabase();
    console.log('Database initialization complete');
  } catch (error) {
    console.error('Database initialization failed:', error);
  }
})();

// フォルダのCRUD操作
export const folderService = {
  getAll: async () => {
    try {
      const db = await initializeDatabase();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(FOLDER_STORE, 'readonly');
        const store = transaction.objectStore(FOLDER_STORE);
        const request = store.getAll();
        
        request.onsuccess = () => resolve(request.result);
        request.onerror = (event) => reject(event.target.error);
      });
    } catch (error) {
      console.error('Error in folderService.getAll:', error);
      throw error;
    }
  },
  
  add: async (folder) => {
    const db = await initializeDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(FOLDER_STORE, 'readwrite');
      const store = transaction.objectStore(FOLDER_STORE);
      const request = store.add({ name: folder.name, createdAt: new Date() });
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = (event) => reject(event.target.error);
    });
  },
  
  update: async (folder) => {
    const db = await initializeDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(FOLDER_STORE, 'readwrite');
      const store = transaction.objectStore(FOLDER_STORE);
      const request = store.put(folder);
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = (event) => reject(event.target.error);
    });
  },
  
  delete: async (id) => {
    const db = await initializeDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(FOLDER_STORE, 'readwrite');
      const store = transaction.objectStore(FOLDER_STORE);
      const request = store.delete(id);
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = (event) => reject(event.target.error);
    });
  }
};

// メモのCRUD操作
export const memoService = {
  getAll: async () => {
    try {
      const db = await initializeDatabase();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(MEMO_STORE, 'readonly');
        const store = transaction.objectStore(MEMO_STORE);
        const request = store.getAll();
        
        request.onsuccess = () => resolve(request.result);
        request.onerror = (event) => reject(event.target.error);
      });
    } catch (error) {
      console.error('Error in memoService.getAll:', error);
      throw error;
    }
  },
  
  getByFolder: async (folderId) => {
    try {
      const db = await initializeDatabase();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(MEMO_STORE, 'readonly');
        const store = transaction.objectStore(MEMO_STORE);
        const index = store.index('folderId');
        const request = index.getAll(folderId);
        
        request.onsuccess = () => resolve(request.result);
        request.onerror = (event) => reject(event.target.error);
      });
    } catch (error) {
      console.error('Error in memoService.getByFolder:', error);
      throw error;
    }
  },
  
  getById: async (id) => {
    const db = await initializeDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(MEMO_STORE, 'readonly');
      const store = transaction.objectStore(MEMO_STORE);
      const request = store.get(id);
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = (event) => reject(event.target.error);
    });
  },
  
  add: async (memo) => {
    try {
      const db = await initializeDatabase();
      return new Promise((resolve, reject) => {
        if (!db.objectStoreNames.contains(MEMO_STORE)) {
          return reject(new Error(`Object store ${MEMO_STORE} not found`));
        }
        
        const transaction = db.transaction(MEMO_STORE, 'readwrite');
        const store = transaction.objectStore(MEMO_STORE);
        
        // クライアント側でcreatedAtとupdatedAtを設定済みの場合は使用
        const memoWithDates = {
          ...memo,
          createdAt: memo.createdAt || new Date(),
          updatedAt: memo.updatedAt || new Date()
        };
        
        console.log('Adding memo to database:', memoWithDates);
        const request = store.add(memoWithDates);
        
        request.onsuccess = () => {
          console.log('Memo added successfully, ID:', request.result);
          resolve(request.result);
        };
        
        request.onerror = (event) => {
          console.error('Error adding memo:', event.target.error);
          reject(event.target.error);
        };
      });
    } catch (error) {
      console.error('Critical error in memoService.add:', error);
      throw error;
    }
  },
  
  update: async (memo) => {
    const db = await initializeDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(MEMO_STORE, 'readwrite');
      const store = transaction.objectStore(MEMO_STORE);
      const request = store.put({
        ...memo,
        updatedAt: new Date()
      });
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = (event) => reject(event.target.error);
    });
  },
  
  delete: async (id) => {
    const db = await initializeDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(MEMO_STORE, 'readwrite');
      const store = transaction.objectStore(MEMO_STORE);
      const request = store.delete(id);
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = (event) => reject(event.target.error);
    });
  }
};
