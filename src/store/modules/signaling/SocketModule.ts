import { makeAutoObservable } from 'mobx';
import { io, Socket } from 'socket.io-client';
import { ITransportLayer } from '../../interfaces/ITransportLayer';
import { FileMeta } from '../file/FileModule';

export type signalingStatus =
  | 'connected'
  | 'disconnected'
  | 'loading'
  | 'waitOther';

export class SocketModule implements ITransportLayer {
  private readonly ownSocket: Socket = io('localhost:5005', {
    autoConnect: false,
  });

  ownId = '';
  remoteSocketId = '';

  currentStatus: signalingStatus = 'loading';

  constructor() {
    makeAutoObservable(this);
  }

  downloadFile = (): void => {
    console.log('downloading...');
  };

  sendBytes = (bytes: Int8Array): void => console.log('send bytes');

  get getFileMeta(): FileMeta | null {
    return null;
  }

  get getCurrentStatus(): signalingStatus {
    return this.currentStatus;
  }

  // actions
  sendInviteToRemote = (remoteSocketId: string): void => {
    this.connectSocket();

    this.ownSocket.on('from receiver to sender', () => {
      this.changeStatusTo('connected');
    });

    this.setRemoteSocketId(remoteSocketId);

    this.ownSocket.emit('from sender to receiver', {
      receiver: remoteSocketId,
      sender: this.ownId,
    });
  };

  waitInviteFromRemote = (): void => {
    this.connectSocket();

    this.ownSocket.on('from sender to receiver', (data: string) => {
      this.setRemoteSocketId(data);
      this.ownSocket.emit('from receiver to sender', this.remoteSocketId);

      this.changeStatusTo('connected');
    });
  };

  sendToRemote = <T>(msg: T): void => {
    console.log('transfer');
    this.ownSocket.emit('msg to socket', {
      receiver: this.remoteSocketId,
      eventName: 'msg to socket',
      data: msg,
    });
  };

  subscribeTo = <T>(eventName: string, fn: (data: T) => void): void => {
    this.ownSocket.on(eventName, (data: T) => {
      fn(data);
    });
  };

  sendEventToRemote = <T>(eventName: string, data?: T): void => {
    this.ownSocket.emit('msg to socket', {
      receiver: this.remoteSocketId,
      eventName,
      data,
    });
  };

  disconnect = (): void => {
    this.sendEventToRemote('socket closed');

    this.ownSocket.disconnect();
    this.changeStatusTo('disconnected');

    this.ownSocket.removeAllListeners();
  };
  // private

  private readonly connectSocket = (): void => {
    if (this.ownSocket.connected) {
      this.disconnect();
    }
    this.ownSocket?.connect();

    this.subscribeTo('socket closed', () => {
      // this.disconnect();
      this.changeStatusTo('waitOther');
    });

    this.subscribeTo('connect', () => {
      this.setOwnId(this.ownSocket.id);
      console.log(this.ownId);
      this.changeStatusTo('waitOther');
    });

    this.subscribeTo('disconnect', () => {
      this.changeStatusTo('disconnected');

      // // reconnect
      // setTimeout(() => {
      //   this.ownSocket?.connect();
      // }, 5000);
    });

    this.subscribeTo('msg to socket', (data) => {
      console.log(data);
    });
  };

  private readonly setOwnId = (id: string): void => {
    this.ownId = id;
  };

  private readonly changeStatusTo = (status: signalingStatus): void => {
    this.currentStatus = status;
  };

  private readonly setRemoteSocketId = (id: string): void => {
    this.remoteSocketId = id;
  };

  sendFile = (file: File): void => {
    console.log(file);
  };
}
