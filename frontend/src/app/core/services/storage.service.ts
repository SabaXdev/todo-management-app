import { Injectable } from '@angular/core';
import { StorageKey } from '../enums/storage-key.enum';

@Injectable({ providedIn: 'root' })
export class StorageService {
  private get storage(): Storage | null {
    return typeof window === 'undefined' ? null : window.localStorage;
  }

  get<T>(key: StorageKey): T | null {
    const raw = this.storage?.getItem(key);
    if (!raw) {
      return null;
    }
    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  }

  set<T>(key: StorageKey, value: T): void {
    this.storage?.setItem(key, JSON.stringify(value));
  }

  remove(key: StorageKey): void {
    this.storage?.removeItem(key);
  }
}
