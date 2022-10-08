import { getRtcServers } from '../../../config/rtc';
import { SignalingModule } from '../signaling/SignalingModule';
import { makeAutoObservable } from 'mobx';

export class RtcModule {
  private readonly signaling;
  private peer: RTCPeerConnection = new RTCPeerConnection();
  private channel: RTCDataChannel = this.peer.createDataChannel('init');

  constructor(signaling: SignalingModule) {
    this.signaling = signaling;

    makeAutoObservable(this);
  }

  sendInvite = async (): Promise<void> => {
    this.peerInit();

    const sdp: RTCSessionDescriptionInit = await this.peer.createOffer();
    await this.peer.setLocalDescription(sdp);

    this.sendSdp(sdp);
  };

  private readonly peerInit = (): void => {
    this.connect();
    this.createChannel();
    this.subscribePeer();
  };

  private readonly connect = (): void => {
    this.peer = new RTCPeerConnection({ iceServers: [...getRtcServers()] });
    console.log(this.peer.getConfiguration());
  };

  private readonly createChannel = (): void => {
    this.channel = this.peer.createDataChannel('files');
    this.channel.binaryType = 'arraybuffer';
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

  private readonly onChannelMessage = (msg: MessageEvent<string>): void => {
    console.log(msg.data);
  };

  private readonly sendSdp = (sdp: RTCSessionDescriptionInit): void => {
    this.signaling.sendToRemote(sdp);
  };

  private readonly sendCandidate = (candidate: RTCIceCandidate): void => {
    this.signaling.sendToRemote(candidate);
  };

  private readonly subscribePeer = (): void => {
    this.peer.onicecandidate = (e: RTCPeerConnectionIceEvent) => {
      if (e.candidate != null) {
        // sendCandidate();
        console.log(e.candidate);
        this.sendCandidate(e.candidate);
      }
    };

    this.signaling.subscribeTo<RTCSessionDescription>('sdp', (sdp): void => {
      void this.peer.setRemoteDescription(sdp);
    });

    this.signaling.subscribeTo<RTCIceCandidate>(
      'candidate',
      (candidate): void => {
        void this.peer.addIceCandidate(candidate);
      },
    );
  };

  waitInvite = (): void => {
    this.signaling.subscribeTo('invite', () => {
      void this.acceptInvite();
    });
  };

  private readonly acceptInvite = async (): Promise<void> => {
    this.peerInit();

    const sdp: RTCSessionDescriptionInit = await this.peer.createAnswer();
    await this.peer.setLocalDescription(sdp);

    this.peer.ondatachannel = (e: RTCDataChannelEvent): void => {
      this.channel = e.channel;
    };

    this.sendSdp(sdp);
  };
}
