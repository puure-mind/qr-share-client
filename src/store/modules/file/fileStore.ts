import { RootStore } from '../../rootStore';

export class FileStore {
  rootStore: RootStore;

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
  }
}
