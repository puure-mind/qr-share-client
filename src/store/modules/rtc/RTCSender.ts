import { getRtcServers } from '../../../config/rtc';
import { makeAutoObservable, when } from 'mobx';
import {
  FileChunk,
  FileMeta,
  FileModule,
  ProcessedFile,
} from '../file/FileModule';

export interface IConnectionStats {
  rtcPair: any | null;
  remoteCandidateId: any | null;
  localCandidateId: any | null;
  remoteType: any | null;
  localType: any | null;
}

export class RTCSender {
  peer = new RTCPeerConnection();
  offer: RTCSessionDescriptionInit | null = null;

  channel: RTCDataChannel = this.peer.createDataChannel('init');

  channelStatus = 'init';

  fileModule: FileModule;
  private processedFile: ProcessedFile | null = null;

  constructor() {
    this.peer = new RTCPeerConnection({ iceServers: [...getRtcServers()] });

    this.createChannel();
    void this.peer.createOffer().then((sdp) => {
      this.setPeerDescription(sdp);
    });
    this.fileModule = new FileModule();

    makeAutoObservable(this);
  }

  setAnswer = (answer: RTCSessionDescriptionInit): void => {
    void this.peer.setRemoteDescription(answer);
  };

  addIceCandidate = (candidate: RTCIceCandidate): void => {
    void this.peer.addIceCandidate(candidate);
  };

  sendBytes = (bytes: Int8Array): void => {
    console.log(bytes);
    const chunkSize = 16384;
    const chunks = [];

    for (let i = 0; i < bytes.length; i += chunkSize) {
      const chunk = { meta: { id: i }, data: bytes.slice(i, i + chunkSize) };
      chunks.push(chunk);
    }

    const sendedObject = {
      command: 'start',
      payload: {
        chunkSize,
        chunksCount: chunks.length,
        fileName: 'fileName.txt',
      },
    };

    console.log('meta:', sendedObject);

    this.channel.send(JSON.stringify(sendedObject));

    void this.sendRecurs(chunks);
  };

  startSendingFile = async (): Promise<void> => {
    if (this.processedFile?.chunks != null) {
      await this.sendRecurs(this.processedFile?.chunks);
    }
  };

  sendRecurs = async (chunks: FileChunk[]): Promise<void> => {
    let i = 0;
    const fcdc = new FlowControlledDataChannel(this.channel);

    while (i < chunks.length) {
      await fcdc.readyProm;

      if (fcdc.ready) {
        fcdc.execute(() => {
          this.sendChunk(chunks[i]);
          console.log('sended chunk: ', i);
          i++;
        });
      }
    }

    await fcdc.readyProm;

    fcdc.execute(() => {
      this.fileSendingEnded();
    });
  };

  fileSendingEnded = (): void => {
    this.channel.send(JSON.stringify({ command: 'end' }));
    console.log('ended');
  };

  sendChunk = (chunk: FileChunk): void => {
    const chunkObject = {
      command: 'chunk',
      payload: chunk,
    };

    this.channel.send(JSON.stringify(chunkObject));
    console.log('chunk sended: ', chunkObject);
  };

  private readonly setPeerDescription = (
    sdp: RTCSessionDescriptionInit,
  ): void => {
    this.offer = sdp;
    void this.peer.setLocalDescription(sdp);
  };

  private readonly createChannel = (): void => {
    this.channel = this.peer.createDataChannel('files');
    this.channel.binaryType = 'arraybuffer';
    this.channel.onopen = this.onChannelOpen;
    this.channel.onmessage = this.onChannelMessage;
    this.channel.onclose = this.onChannelClose;
  };

  private readonly onChannelOpen = (): void => {
    this.changeChannelStatus('connected');
    console.log('channel open');

    void this.peer.getStats(null).then((stats) => {
      const connectionStats = this.getConnectionTypeFromStats(stats);
      console.log(connectionStats);
    });
  };

  private readonly getConnectionTypeFromStats = (
    stats: RTCStatsReport,
  ): IConnectionStats => {
    let rtcPair: any | null = null;
    let remoteCandidateId: any | null = null;
    let localCandidateId: any | null = null;
    let remoteType: any | null = null;
    let localType: any | null = null;

    stats.forEach((res) => {
      if (res.state === 'succeeded') {
        rtcPair = res;
      }
    });

    if (rtcPair !== null) {
      remoteCandidateId = rtcPair.remoteCandidateId;
      localCandidateId = rtcPair.localCandidateId;

      stats.forEach((res) => {
        if (res.id === remoteCandidateId) {
          remoteType = res.candidateType;
        }
        if (res.id === localCandidateId) {
          localType = res.candidateType;
        }
      });
    }

    return {
      rtcPair,
      remoteCandidateId,
      localCandidateId,
      remoteType,
      localType,
    };
  };

  private readonly onChannelClose = (): void => {
    this.changeChannelStatus('disconnected');
    console.log('channel close');
  };

  private readonly onChannelMessage = async (
    msg: MessageEvent<string>,
  ): Promise<void> => {
    const { data } = msg;
    const { command } = JSON.parse(data);

    switch (command) {
      case 'ready': {
        await this.startSendingFile();
        break;
      }
    }

    console.log(msg.data);
  };

  private readonly changeChannelStatus = (status: string): void => {
    this.channelStatus = status;
  };

  sendToRemote = (msg: string): void => {
    this.channel.send(msg);
  };

  sendFile = async (file: File): Promise<void> => {
    this.processedFile = await this.fileModule.processFile(file);

    this.sendFileMeta(this.processedFile.meta);

    console.log(this.processedFile);
  };

  private readonly sendFileMeta = (meta: FileMeta): void => {
    this.channel.send(JSON.stringify({ command: 'start', payload: meta }));
  };
}

class FlowControlledDataChannel {
  dc;
  paused;
  ready;
  highWaterMark;
  readyProm;

  constructor(
    dc: RTCDataChannel,
    lowWaterMark = 262144,
    highWaterMark = 1048576,
  ) {
    makeAutoObservable(this);
    this.dc = dc;
    this.paused = false;
    this.ready = true;
    this.readyProm = Promise.resolve();
    this.highWaterMark = highWaterMark;

    // Drain once ready
    this.dc.bufferedAmountLowThreshold = lowWaterMark;
    this.dc.onbufferedamountlow = () => {
      console.log(`buffer event ${this.dc.bufferedAmount}`);
      // Continue once low water mark has been reached
      if (this.paused) {
        console.log(
          `Data channel ${this.dc.label} resumed @ ${this.dc.bufferedAmount}`,
        );
        this.paused = false;
        this.ready = true;
        this.readyProm = new Promise<void>((resolve) => {
          resolve();
        });
      }
    };
  }

  execute(fn: () => void): void {
    if (this.paused || !this.ready) {
      return;
    }

    fn();

    // Pause once high water mark has been reached
    if (!this.paused && this.dc.bufferedAmount >= this.highWaterMark) {
      this.paused = true;
      this.ready = false;
      this.readyProm = new Promise<void>((resolve) => {
        when(
          () => this.ready,
          () => setTimeout(() => resolve(), 100),
        );
      });

      console.log(
        `Data channel ${this.dc.label} paused @ ${this.dc.bufferedAmount}`,
      );
    }
  }
}
