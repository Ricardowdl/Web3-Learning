import type { StateStorage } from 'zustand/middleware'

/* IndexedDB 实现（保留，已注释）
const dbName = 'web3_dapp_store'
const storeName = 'zustand'

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('no-window'))
      return
    }
    const request = indexedDB.open(dbName, 1)
    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(storeName)) {
        db.createObjectStore(storeName)
      }
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error || new Error('idb-open-error'))
  })
}

export const idbStorage: StateStorage = {
  getItem: async (name) => {
    try {
      const db = await openDB()
      return await new Promise<string | null>((resolve, reject) => {
        const tx = db.transaction(storeName, 'readonly')
        const store = tx.objectStore(storeName)
        const req = store.get(name)
        req.onsuccess = () => resolve((req.result as string) ?? null)
        req.onerror = () => reject(req.error || new Error('idb-get-error'))
      })
    } catch {
      return null
    }
  },
  setItem: async (name, value) => {
    try {
      const db = await openDB()
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(storeName, 'readwrite')
        const store = tx.objectStore(storeName)
        const req = store.put(value, name)
        req.onsuccess = () => resolve()
        req.onerror = () => reject(req.error || new Error('idb-set-error'))
      })
    } catch {}
  },
  removeItem: async (name) => {
    try {
      const db = await openDB()
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(storeName, 'readwrite')
        const store = tx.objectStore(storeName)
        const req = store.delete(name)
        req.onsuccess = () => resolve()
        req.onerror = () => reject(req.error || new Error('idb-remove-error'))
      })
    } catch {}
  },
}
*/

export const lsStorage: StateStorage = {
  getItem: async (name) => {
    try {
      if (typeof window === 'undefined') return null
      return window.localStorage.getItem(name)
    } catch {
      return null
    }
  },
  setItem: async (name, value) => {
    try {
      if (typeof window === 'undefined') return
      window.localStorage.setItem(name, value)
    } catch { }
  },
  removeItem: async (name) => {
    try {
      if (typeof window === 'undefined') return
      window.localStorage.removeItem(name)
    } catch { }
  },
}
