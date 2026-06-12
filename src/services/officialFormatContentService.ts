const DATABASE_NAME = 'edusudamericano_official_format_files';
const DATABASE_VERSION = 1;
const STORE_NAME = 'files';

interface StoredOfficialFormatContent {
  id: string;
  blob: Blob;
}

const openDatabase = (): Promise<IDBDatabase> => new Promise((resolve, reject) => {
  const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);

  request.onupgradeneeded = () => {
    const database = request.result;
    if (!database.objectStoreNames.contains(STORE_NAME)) {
      database.createObjectStore(STORE_NAME, { keyPath: 'id' });
    }
  };

  request.onsuccess = () => resolve(request.result);
  request.onerror = () => reject(request.error);
});

export const OfficialFormatContentService = {
  save: async (id: string, blob: Blob): Promise<void> => {
    const database = await openDatabase();

    await new Promise<void>((resolve, reject) => {
      const transaction = database.transaction(STORE_NAME, 'readwrite');
      transaction.objectStore(STORE_NAME).put({ id, blob } satisfies StoredOfficialFormatContent);
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });

    database.close();
  },

  get: async (id: string): Promise<Blob | null> => {
    const database = await openDatabase();

    const result = await new Promise<StoredOfficialFormatContent | undefined>((resolve, reject) => {
      const request = database.transaction(STORE_NAME, 'readonly').objectStore(STORE_NAME).get(id);
      request.onsuccess = () => resolve(request.result as StoredOfficialFormatContent | undefined);
      request.onerror = () => reject(request.error);
    });

    database.close();
    return result?.blob || null;
  },

  remove: async (id: string): Promise<void> => {
    const database = await openDatabase();

    await new Promise<void>((resolve, reject) => {
      const transaction = database.transaction(STORE_NAME, 'readwrite');
      transaction.objectStore(STORE_NAME).delete(id);
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });

    database.close();
  }
};
