import React, { createContext } from 'react';
import { RootStore } from './rootStore';
import { SocketModule } from './modules/signaling/SocketModule';
import { RtcModule } from './modules/rtc/RtcModule';
import { SenderCreator } from './modules/sender/SenderCreator';
import { ReceiverCreator } from './modules/receiver/ReceiverCreator';
import { FileModule } from './modules/file/FileModule';

export type RootContext = RootStore | null;

// DI
const socketModule = new SocketModule();
const rtcModule = new RtcModule(socketModule);

const fileModule = new FileModule();
const senderCreator = new SenderCreator();
const receiverCreator = new ReceiverCreator();

const rootStore = new RootStore(
  socketModule,
  rtcModule,
  fileModule,
  senderCreator,
  receiverCreator,
);
//

interface Props {
  children: JSX.Element;
}

const RootStoreContext = createContext<RootContext>(null);

export const RootStoreProvider: React.FC<Props> = ({ children }) => (
  <RootStoreContext.Provider value={rootStore}>
    {children}
  </RootStoreContext.Provider>
);

export default RootStoreContext;
