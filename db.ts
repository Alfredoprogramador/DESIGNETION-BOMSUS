
import { Assignment, Settings } from './types';
import { PEOPLE_LIST } from './data/people';

const DB_NAME = 'banco Designações';
const DB_VERSION = 1;
const ASSIGNMENTS_STORE = 'assignments';
const SETTINGS_STORE = 'settings';

let db: IDBDatabase;

export const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    if (db) {
      return resolve(db);
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      console.error("IndexedDB error:", request.error);
      reject(request.error);
    };

    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const dbInstance = (event.target as IDBOpenDBRequest).result;
      if (!dbInstance.objectStoreNames.contains(ASSIGNMENTS_STORE)) {
        dbInstance.createObjectStore(ASSIGNMENTS_STORE); // key is date string YYYY-MM-DD
      }
      if (!dbInstance.objectStoreNames.contains(SETTINGS_STORE)) {
        const settingsStore = dbInstance.createObjectStore(SETTINGS_STORE);
        // Pre-populate settings with default values when the store is first created
        const defaultSettings: Settings = {
            meetingDays: [3, 6], // Wednesday, Saturday
            people: PEOPLE_LIST,
        };
        settingsStore.put(defaultSettings, 'appSettings');
      }
    };
  });
};

export const getAllAssignments = (): Promise<Record<string, Assignment>> => {
  return new Promise(async (resolve, reject) => {
    try {
        const db = await initDB();
        const transaction = db.transaction(ASSIGNMENTS_STORE, 'readonly');
        const store = transaction.objectStore(ASSIGNMENTS_STORE);
        const request = store.openCursor();
        const assignments: Record<string, Assignment> = {};
    
        request.onsuccess = (event) => {
          const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
          if (cursor) {
            assignments[cursor.key as string] = cursor.value;
            cursor.continue();
          } else {
            resolve(assignments);
          }
        };
    
        request.onerror = () => {
          console.error('Error getting assignments:', request.error);
          reject(request.error);
        };
    } catch (error) {
        reject(error);
    }
  });
};

export const saveAssignments = (assignments: Record<string, Assignment>): Promise<void> => {
    return new Promise(async (resolve, reject) => {
        try {
            const db = await initDB();
            const transaction = db.transaction(ASSIGNMENTS_STORE, 'readwrite');
            const store = transaction.objectStore(ASSIGNMENTS_STORE);
            
            const clearRequest = store.clear(); // Clear the old data
            
            clearRequest.onerror = () => {
                reject(clearRequest.error);
            };
    
            clearRequest.onsuccess = () => {
                // Add new data
                const keys = Object.keys(assignments);
                if (keys.length === 0) {
                    transaction.commit();
                    resolve();
                    return;
                }
                keys.forEach(key => {
                    store.put(assignments[key], key);
                });
            };
    
            transaction.oncomplete = () => {
                resolve();
            };
    
            transaction.onerror = () => {
                console.error('Error saving assignments:', transaction.error);
                reject(transaction.error);
            };
        } catch (error) {
            reject(error);
        }
    });
};

export const getSettings = (): Promise<Settings> => {
  return new Promise(async (resolve, reject) => {
    try {
        const db = await initDB();
        const transaction = db.transaction(SETTINGS_STORE, 'readonly');
        const store = transaction.objectStore(SETTINGS_STORE);
        const request = store.get('appSettings');
    
        request.onsuccess = () => {
            if (request.result) {
                resolve(request.result);
            } else {
                // This case should be rare, as onupgradeneeded populates it.
                // But as a fallback, we create default settings.
                const defaultSettings: Settings = {
                    meetingDays: [3, 6],
                    people: PEOPLE_LIST,
                };
                saveSettings(defaultSettings).then(() => resolve(defaultSettings));
            }
        };
        
        request.onerror = () => {
          console.error('Error getting settings:', request.error);
          reject(request.error);
        };
    } catch (error) {
        reject(error);
    }
  });
};

export const saveSettings = (settings: Settings): Promise<void> => {
    return new Promise(async (resolve, reject) => {
        try {
            const db = await initDB();
            const transaction = db.transaction(SETTINGS_STORE, 'readwrite');
            const store = transaction.objectStore(SETTINGS_STORE);
            const request = store.put(settings, 'appSettings');
    
            request.onsuccess = () => {
                resolve();
            };
            
            request.onerror = () => {
                console.error('Error saving settings:', request.error);
                reject(request.error);
            };
        } catch (error) {
            reject(error);
        }
    });
};
