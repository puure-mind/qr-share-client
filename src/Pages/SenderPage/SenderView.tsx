import React, { useContext, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { useSearchParams } from 'react-router-dom';
import { Button, Typography } from '@mui/material';
import RootStoreContext, { RootContext } from '../../store/RootStoreProvider';

export const SenderView = observer(() => {
  const [search] = useSearchParams();
  const receiverId = search.get('id');
  const rootStore = useContext<RootContext>(RootStoreContext);
  if (rootStore === null) return <></>;

  useEffect(() => {
    receiverId !== null && rootStore.connectToReceiver(receiverId);

    return () => {
      rootStore.disconnectSignaling();
    };
  }, [receiverId, rootStore]);

  const sendToRemote = (): void => {
    rootStore.sendMessage('hello from sender');
  };

  const rtcConnect = (): void => {
    rootStore.sendInvite();
  };

  return (
    <>
      <Typography>{receiverId}</Typography>;
      <Button onClick={sendToRemote}>Send msg</Button>
      <Button onClick={rtcConnect}>RTCConnect</Button>
    </>
  );
});
