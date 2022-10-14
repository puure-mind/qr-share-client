import { SignalingModule } from '../signaling/SignalingModule';
import { makeAutoObservable, when } from 'mobx';
import { RTCSender } from './RTCSender';
import { RTCReceiver } from './RTCReceiver';

export class RtcModule {
  private readonly signaling;
  private Sender: RTCSender;
  private Receiver: RTCReceiver;

  constructor(signaling: SignalingModule) {
    this.signaling = signaling;
    this.Sender = new RTCSender();
    this.Receiver = new RTCReceiver();

    makeAutoObservable(this);
  }

  get getStatus(): string {
    return 'rtcConnect';
  }

  get getProgress(): number {
    return this.Receiver.getProgress;
  }

  get downloadUrl(): string {
    return this.Receiver.downloadUrl;
  }

  createInvite = async (): Promise<void> => {
    this.Sender = new RTCSender();

    this.subscribeSender(this.Sender);

    when(
      () => this.Sender.offer !== null,
      () => {
        this.sendOffer(this.Sender.offer);
      },
    );
  };

  sendBytes = (bytes: Int8Array): void => {
    this.Sender.sendBytes(bytes);
  };

  private readonly sendOffer = (
    offer: RTCSessionDescriptionInit | null,
  ): void => {
    this.signaling.sendEventToRemote<RTCSessionDescriptionInit | null>(
      'offer',
      offer,
    );
  };

  private readonly subscribeSender = (Sender: RTCSender): void => {
    this.signaling.subscribeTo<RTCSessionDescriptionInit>(
      'answer',
      (answer) => {
        Sender.setAnswer(answer);
      },
    );

    this.signaling.subscribeTo<RTCIceCandidate>(
      'candidate',
      (candidate): void => {
        Sender.addIceCandidate(candidate);
      },
    );

    Sender.peer.onicecandidate = (e: RTCPeerConnectionIceEvent) => {
      if (e.candidate != null) {
        // console.log('sender candidates: ', e.candidate);
        this.signaling.sendEventToRemote('candidate', e.candidate);
      }
    };
  };

  waitInvite = (): void => {
    this.signaling.subscribeTo<RTCSessionDescriptionInit | null>(
      'offer',
      (data) => {
        if (data != null) void this.acceptInvite(data);
      },
    );
  };

  private readonly acceptInvite = async (
    offer: RTCSessionDescriptionInit,
  ): Promise<void> => {
    // const Receiver = new RTCReceiver();
    this.Receiver = new RTCReceiver();

    this.subscribeReceiver(this.Receiver);

    await this.Receiver.createAnswer(offer);

    when(
      () => this.Receiver.answer !== null,
      () => this.sendAnswer(this.Receiver.answer),
    );
  };

  private readonly sendAnswer = (
    answer: RTCSessionDescriptionInit | null,
  ): void => {
    this.signaling.sendEventToRemote<RTCSessionDescriptionInit | null>(
      'answer',
      answer,
    );
  };

  private readonly subscribeReceiver = (Receiver: RTCReceiver): void => {
    Receiver.peer.onicecandidate = (e: RTCPeerConnectionIceEvent) => {
      if (e.candidate != null) {
        this.signaling.sendEventToRemote('candidate', e.candidate);
      }
    };

    this.signaling.subscribeTo<RTCIceCandidate>(
      'candidate',
      (candidate): void => {
        void Receiver.addIceCandidate(candidate);
      },
    );
  };
}
