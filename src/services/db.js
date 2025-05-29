const DB_NAME = 'memoAppDB';
const DB_VERSION = 1;
const FOLDER_STORE = 'folders';
const MEMO_STORE = 'memos';

// データベース初期化の単一のエントリーポイント
const openDB = () => {
  return new Promise((resolve, reject) => {
    console.log(`データベースを開いています: ${DB_NAME}, バージョン: ${DB_VERSION}`);
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      console.log(`データベースをバージョン ${DB_VERSION} にアップグレードしています`);
      const db = event.target.result;
      
      // フォルダストアの作成
      if (!db.objectStoreNames.contains(FOLDER_STORE)) {
        console.log(`オブジェクトストアを作成中: ${FOLDER_STORE}`);
        const folderStore = db.createObjectStore(FOLDER_STORE, { keyPath: 'id', autoIncrement: true });
        folderStore.createIndex('name', 'name', { unique: false });
      }
      
      // メモストアの作成
      if (!db.objectStoreNames.contains(MEMO_STORE)) {
        console.log(`オブジェクトストアを作成中: ${MEMO_STORE}`);
        const memoStore = db.createObjectStore(MEMO_STORE, { keyPath: 'id', autoIncrement: true });
        memoStore.createIndex('folderId', 'folderId', { unique: false });
        memoStore.createIndex('updatedAt', 'updatedAt', { unique: false });
      }
    };

    request.onsuccess = (event) => {
      console.log('データベースが正常に開かれました');
      resolve(event.target.result);
    };
    
    request.onerror = (event) => {
      console.error('データベース開始エラー:', event.target.error);
      reject(event.target.error);
    };
  });
};

// 既存のデータベースをリセットする関数
const resetDatabase = () => {
  return new Promise((resolve, reject) => {
    console.log('既存のデータベースを削除しています...');
    const deleteRequest = indexedDB.deleteDatabase(DB_NAME);
    
    deleteRequest.onsuccess = () => {
      console.log('データベースが正常に削除されました。再作成しています...');
      openDB().then(resolve).catch(reject);
    };
    
    deleteRequest.onerror = (event) => {
      console.error('データベース削除エラー:', event.target.error);
      reject(event.target.error);
    };
  });
};

// データベースの存在確認と初期化をする関数
const initializeDatabase = async () => {
  try {
    const db = await openDB();
    const storeNames = Array.from(db.objectStoreNames);
    console.log('現在のオブジェクトストア:', storeNames);
    
    // 必要なストアが存在するか確認
    if (!storeNames.includes(FOLDER_STORE) || !storeNames.includes(MEMO_STORE)) {
      console.warn('必要なオブジェクトストアが見つかりません。データベースをリセットしています...');
      return resetDatabase();
    }
    
    return db;
  } catch (error) {
    console.error('データベース初期化中のエラー:', error);
    // エラーが発生した場合、データベースをリセットして再作成
    return resetDatabase();
  }
};

// アプリケーション起動時にデータベースを初期化
(async () => {
  try {
    await initializeDatabase();
    console.log('データベース初期化が完了しました');
  } catch (error) {
    console.error('データベース初期化に失敗しました:', error);
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
      console.error('フォルダの取得中にエラーが発生しました:', error);
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
      console.error('memoService.getAllでのエラー:', error);
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
      console.error('memoService.getByFolderでのエラー:', error);
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
          return reject(new Error(`オブジェクトストア ${MEMO_STORE} が見つかりません`));
        }
        
        const transaction = db.transaction(MEMO_STORE, 'readwrite');
        const store = transaction.objectStore(MEMO_STORE);
        
        // クライアント側でcreatedAtとupdatedAtを設定済みの場合は使用
        const memoWithDates = {
          ...memo,
          createdAt: memo.createdAt || new Date(),
          updatedAt: memo.updatedAt || new Date()
        };
        
        console.log('メモをデータベースに追加しています:', memoWithDates);
        const request = store.add(memoWithDates);
        
        request.onsuccess = () => {
          console.log('メモが正常に追加されました。ID:', request.result);
          resolve(request.result);
        };
        
        request.onerror = (event) => {
          console.error('メモ追加エラー:', event.target.error);
          reject(event.target.error);
        };
      });
    } catch (error) {
      console.error('memoService.addでの重大なエラー:', error);
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
