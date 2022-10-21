import { signalingStatus } from '../modules/signaling/SocketModule';
import { FileMeta } from '../modules/file/FileModule';

export interface ITransportLayer {
  getFileMeta: FileMeta | null;
  getCurrentStatus: signalingStatus;
  ownId: string;
  disconnect: () => void;
  waitInviteFromRemote: () => void;
  sendInviteToRemote: (remoteId: string) => void;
  sendToRemote: (msg: string) => void;

  sendBytes: (bytes: Int8Array) => void;

  sendFile: (file: File) => void;

  downloadFile: () => void;
}
