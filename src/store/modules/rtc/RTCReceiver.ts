import { getRtcServers } from '../../../config/rtc';
import { autorun, makeAutoObservable, when } from 'mobx';

export class RTCReceiver {
  peer = new RTCPeerConnection();
  answer: RTCSessionDescriptionInit | null = null;
  channel = this.peer.createDataChannel('init');

  downloadUrl = '';
  fileParams: any = {};
  chunks: any[] = [];
  progress = 0;

  candidates: RTCIceCandidate[] = [];

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

  get getProgress(): number {
    return this.progress;
  }

  createAnswer = async (offer: RTCSessionDescriptionInit): Promise<void> => {
    await this.peer.setRemoteDescription(offer);
    this.answer = await this.peer.createAnswer();
    await this.peer.setLocalDescription(this.answer);
  };

  addIceCandidate = (candidate: RTCIceCandidate): void => {
    console.log(candidate);
    void this.peer.addIceCandidate(candidate);
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
    const object = JSON.parse(data);
    if (object.command === 'start') {
      this.setFileParams(object.payload);
      this.chunks = [];
      this.setProgress(0);
      console.log(this.fileParams);
    }
    if (object.command === 'chunk') {
      await this.receiveChunk(object.payload.data);
    }
    if (object.command === 'end') {
      this.createFile();
    }

    // this.createFileFromBytes(msg.data);
  };

  private readonly receiveChunk = async (chunk: any): Promise<void> => {
    // this.chunks = [...this.chunks, ...Object.values(chunk)];
    this.chunks.push(...Object.values(chunk));

    this.setProgress(
      (this.chunks.length /
        this.fileParams.chunkSize /
        this.fileParams.chunksCount) *
        100,
    );
  };

  private readonly setProgress = (loaded: number): void => {
    this.progress = loaded;
  };

  private readonly setFileParams = (params: object): void => {
    this.fileParams = params;
  };

  private readonly createFile = (): void => {
    const bytesFile: Int8Array = new Int8Array(this.chunks);

    console.log(bytesFile);
    const blob: BlobPart[] = [];
    blob.push(bytesFile);
    const receivedFile = new File(blob, this.fileParams.fileName);
    console.log(receivedFile);
    this.setProgress(100);
  };

  private readonly createFileFromBytes = (bytes: Int8Array): void => {
    const blob: BlobPart[] = [];
    blob.push(bytes);
    const receivedFile = new File(blob, 'received.jpg');

    console.log(receivedFile);

    this.downloadUrl = window.URL.createObjectURL(receivedFile);

    // const link = document.createElement('a');
    // link.href = downloadUrl;
    // link.download = receivedFile.name;
    // document.body.appendChild(link);
    // link.click();
    // link.remove();
  };
}
