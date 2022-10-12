import React, { useContext, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { useSearchParams } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Container,
  TextField,
} from '@mui/material';
import RootStoreContext, { RootContext } from '../../store/RootStoreProvider';

export const SenderView = observer(() => {
  const [search] = useSearchParams();
  const receiverId = search.get('id');
  const rootStore = useContext<RootContext>(RootStoreContext);
  if (rootStore === null) return <></>;

  useEffect(() => {
    const rtcConnect = (): void => {
      rootStore.sendInvite();
    };

    receiverId !== null && rootStore.connectToReceiver(receiverId);
    rtcConnect();

    return () => {
      rootStore.disconnectSignaling();
    };
  }, [receiverId, rootStore]);

  const sendToRemote = (): void => {
    rootStore.sendMessage('hello from sender');
  };

  const rtcReconnect = (): void => {
    // rtcConnect();
  };

  return (
    <>
      <Container
        maxWidth={false}
        disableGutters
        sx={{
          height: '100vh',
          backgroundColor: 'grey.500',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Card
          raised
          sx={{
            p: 1,
            width: 0.5,
            height: 0.5,
            display: 'flex',
            flexFlow: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            '&': { borderRadius: '20px' },
          }}
        >
          <CardContent>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                py: 2,
              }}
            >
              <TextField
                label='Receiver Id: '
                InputLabelProps={{ shrink: true }}
              />
              <Button onClick={rtcReconnect}>Reconnect</Button>
            </Box>
            <TextField type='file' name='file' />
          </CardContent>
          <CardActions>
            <Button onClick={sendToRemote}>Send msg</Button>
          </CardActions>
        </Card>
      </Container>
    </>
  );
});
