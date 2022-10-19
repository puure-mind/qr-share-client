import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardMedia,
  CircularProgress,
  Container,
  LinearProgress,
  Typography,
} from '@mui/material';
import { QRCodeSVG } from 'qrcode.react';
import { Link } from 'react-router-dom';
import React, { useContext, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import RootStoreContext, { RootContext } from '../../store/RootStoreProvider';

export const ReceiverView: React.FC = observer(() => {
  const rootStore = useContext<RootContext>(RootStoreContext);

  if (rootStore === null) return <></>;

  const receiverLink = `signaling?id=${rootStore.receiveLink}`;

  useEffect(() => {
    rootStore.createReceiveLink();

    // rootStore.waitInvite();

    rootStore.waitFile();

    return () => {
      rootStore.disconnectSignaling();
    };
  }, [rootStore]);

  const refreshLink = (): void => {
    rootStore.createReceiveLink();

    // rootStore.waitInvite();
  };

  const sendToRemote = (): void => {
    rootStore.sendMessageToSender('hello from receiver');
  };

  return (
    <>
      <Container
        maxWidth={false}
        disableGutters
        sx={{
          height: '100vh',
          backgroundColor: 'primary.main',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Box
          sx={{
            width: 0.5,
            height: 0.7,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          {rootStore.signalingStatus === 'waitOther' ||
          rootStore.signalingStatus === 'connected' ? (
            <Card
              raised
              sx={{
                p: 1,
                width: 1,
                height: 1,
                display: 'flex',
                flexFlow: 'column',
                justifyContent: 'center',
                '&': { borderRadius: '20px' },
              }}
            >
              <CardMedia
                component='div'
                sx={{ flexGrow: 0.7, pt: 1, width: 1, height: 0.7 }}
              >
                <QRCodeSVG
                  value={rootStore.receiveLink}
                  style={{
                    width: '100%',
                    height: '100%',
                  }}
                />
              </CardMedia>
              <CardContent sx={{ flexGrow: 0.1 }}>
                <Typography variant='h4' textAlign='center'>
                  personal link:
                  <Link to={receiverLink}>{rootStore.receiveLink}</Link>
                </Typography>
                {rootStore.downloadLink !== '' && (
                  <Typography>
                    download:
                    <span onClick={rootStore.downloadFile}>download file</span>
                  </Typography>
                )}
                {rootStore.downloadProgress !== 0 && (
                  <LinearProgress
                    variant='determinate'
                    value={rootStore.downloadProgress}
                  />
                )}
              </CardContent>
              <CardActions
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  flexGrow: 0.2,
                }}
              >
                <Button
                  onClick={refreshLink}
                  size='large'
                  variant='contained'
                  color='secondary'
                >
                  Refresh
                </Button>
                <Button onClick={sendToRemote} size='large' variant='contained'>
                  send msg
                </Button>
                <Button onClick={rootStore.saveFile}>save</Button>
              </CardActions>
            </Card>
          ) : (
            <CircularProgress color='secondary' />
          )}
        </Box>
      </Container>
    </>
  );
});
