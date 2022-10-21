import { getRtcServers } from '../../../config/rtc';
import { makeAutoObservable } from 'mobx';
import { FileMeta } from '../file/FileModule';

export class RTCReceiver {
  peer = new RTCPeerConnection();
  answer: RTCSessionDescriptionInit | null = null;
  channel = this.peer.createDataChannel('init');

  downloadUrl = '';

  progress = 0;

  fileHandle: FileSystemFileHandle | null = null;
  writer: FileSystemWritableFileStream | null = null;

  candidates: RTCIceCandidate[] = [];
  private remoteFileMeta: FileMeta | null = null;

  constructor() {
    this.peer = new RTCPeerConnection({ iceServers: [...getRtcServers()] });

    this.peer.ondatachannel = (e: RTCDataChannelEvent): void => {
      this.createChannel(e.channel);
      console.log(e.channel);
    };

    this.peer.onicecandidate = (e: RTCPeerConnectionIceEvent) => {
      console.log('receiver candidate ', e.candidate);
      if (e.candidate != null) {
        console.log('receiver candidate ', e.candidate);
        this.candidates.push(e.candidate);
      }
    };

    makeAutoObservable(this);
  }

  get getFileMeta(): FileMeta | null {
    return this.remoteFileMeta;
  }

  get getProgress(): number {
    return this.progress;
  }

  downloadFile = async (): Promise<void> => {
    await this.createFileHandle();
    this.requestFileChunks();
  };

  createAnswer = async (offer: RTCSessionDescriptionInit): Promise<void> => {
    await this.peer.setRemoteDescription(offer);
    this.answer = await this.peer.createAnswer();
    await this.peer.setLocalDescription(this.answer);
  };

  addIceCandidate = (candidate: RTCIceCandidate): void => {
    console.log(candidate);
    void this.peer.addIceCandidate(candidate);
  };

  private readonly createFileHandle = async (): Promise<void> => {
    this.fileHandle = await showSaveFilePicker({
      suggestedName: this.remoteFileMeta?.fileName,
    });
    this.writer = await this.fileHandle.createWritable();
  };

  private readonly requestFileChunks = (): void => {
    this.channel.send(JSON.stringify({ command: 'ready' }));
  };

  private readonly createChannel = (channel: RTCDataChannel): void => {
    this.channel = channel;
    this.channel.onopen = this.onChannelOpen;
    this.channel.onmessage = this.onChannelMessage;
    this.channel.onclose = this.onChannelClose;
  };

  private readonly onChannelOpen = (): void => {
    console.log('channel open');
  };

  private readonly onChannelClose = (): void => {
    console.log('channel close');
  };

  private readonly onChannelMessage = async (
    msg: MessageEvent<string>,
  ): Promise<void> => {
    const { data } = msg;
    const { command, payload } = JSON.parse(data);

    switch (command) {
      case 'start': {
        this.setFileMeta(payload);

        break;
      }
      case 'chunk': {
        const chunk: Int8Array = new Int8Array(Object.values(payload.data));

        await this.writeChunkToFile(chunk);
        console.log(chunk);
        break;
      }
      case 'end': {
        console.log('closing');
        await this.closeFile();
        this.clearFileMeta();
        break;
      }
    }
  };

  private readonly setFileMeta = (fileMeta: FileMeta | null): void => {
    this.remoteFileMeta = fileMeta;
    console.log(this.remoteFileMeta);
  };

  private readonly writeChunkToFile = async (
    chunk: Int8Array,
  ): Promise<void> => {
    await this.writer?.write(chunk);
  };

  private readonly closeFile = async (): Promise<void> => {
    await this.writer?.close();
    const file = await this.fileHandle?.getFile();

    console.log(file);
  };

  private readonly setProgress = (loaded: number): void => {
    this.progress = loaded;
  };

  private readonly clearFileMeta = (): void => {
    this.setFileMeta(null);
  };
}
