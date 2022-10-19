import { signalingStatus } from '../modules/signaling/SocketModule';

export interface ITransportLayer {
  getCurrentStatus: signalingStatus;
  ownId: string;
  disconnect: () => void;
  waitInviteFromRemote: () => void;
  sendInviteToRemote: (remoteId: string) => void;
  sendToRemote: (msg: string) => void;
}
