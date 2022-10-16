import { getRtcServers } from '../../../config/rtc';
import { autorun, makeAutoObservable, when } from 'mobx';
import internal from 'stream';

export class RTCSender {
  peer = new RTCPeerConnection();
  offer: RTCSessionDescriptionInit | null = null;

  channel: RTCDataChannel = this.peer.createDataChannel('init');

  channelStatus = 'init';

  constructor() {
    this.peer = new RTCPeerConnection({ iceServers: [...getRtcServers()] });

    this.createChannel();
    void this.peer.createOffer().then((sdp) => {
      this.setPeerDescription(sdp);
    });

    makeAutoObservable(this);
  }

  get getChannelStatus(): string {
    return this.channelStatus;
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

    // chunks.forEach((chunk) => {
    //   const chunkObject = {
    //     command: 'chunk',
    //     payload: chunk,
    //   };
    //   this.channel.send(JSON.stringify(chunkObject));
    // });

    // this.sendChunks(chunks);

    // void this.sendYielded(chunks);
    void this.sendRecurs(chunks);
  };

  sendRecurs = async (chunks: any[]): Promise<void> => {
    let i = 0;
    const fcdc = new FlowControlledDataChannel(this.channel);

    // await this.sendToChannel(fcdc, chunks, 0, chunks.length);

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
      this.sendEnded();
    });

    // while (i < chunks.length) {
    //   if (fcdc.ready) {
    //     fcdc.execute(() => {
    //       this.sendChunk(chunks[i]);
    //     });
    //     console.log('sended chunk: ', i);
    //     i++;
    //   }
    // }
  };

  sendToChannel = async (
    fcdc: FlowControlledDataChannel,
    chunks: any[],
    startIndex: number,
    endIndex: number,
  ): Promise<void> => {
    console.log('paused: ', fcdc.paused, ' ready: ', fcdc.ready);
    if (fcdc.ready) {
      fcdc.execute(() => {
        this.sendChunk(chunks[startIndex]);
      });
      const nextIndex = startIndex + 1;
      if (nextIndex < endIndex) {
        await this.sendToChannel(fcdc, chunks, nextIndex, endIndex);
      } else {
        this.sendEnded();
      }
    } else {
      void this.sendToChannel(fcdc, chunks, startIndex, endIndex);
    }
  };

  sendEnded = (): void => {
    this.channel.send(JSON.stringify({ command: 'end' }));
    console.log('ended');
  };

  sendChunk = (chunk: any): void => {
    // await this.freeChannel();

    const chunkObject = {
      command: 'chunk',
      payload: chunk,
    };

    this.channel.send(JSON.stringify(chunkObject));
    console.log('chunk sended: ', chunkObject);
  };

  freeChannel = async (): Promise<void> => {
    return await new Promise((resolve) => {
      if (
        this.channel.bufferedAmount > this.channel.bufferedAmountLowThreshold
      ) {
        return;
      }
      console.log('resolved');
      resolve();
    });
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
  };

  private readonly onChannelClose = (): void => {
    this.changeChannelStatus('disconnected');
    console.log('channel close');
  };

  private readonly onChannelMessage = (msg: MessageEvent<Int8Array>): void => {
    console.log(msg.data);
  };

  private readonly changeChannelStatus = (status: string): void => {
    this.channelStatus = status;
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
