// IndexedDB setup
const DB_NAME = 'RailwayN8nDB';
const DB_VERSION = 1;
const N8N_STORE = 'n8n_config';

let db;

export const initDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(N8N_STORE)) {
        db.createObjectStore(N8N_STORE, { keyPath: 'id' });
      }
    };
  });
};

export const saveN8nConfig = async (config) => {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([N8N_STORE], 'readwrite');
    const store = transaction.objectStore(N8N_STORE);
    
    const data = {
      id: 'n8n',
      ...config,
      timestamp: Date.now()
    };
    
    const request = store.put(data);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(data);
  });
};

export const getN8nConfig = async () => {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([N8N_STORE], 'readonly');
    const store = transaction.objectStore(N8N_STORE);
    const request = store.get('n8n');
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
};
